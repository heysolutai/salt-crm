import { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { socketService } from '../../config/socket.js';
import { uazapiService } from '../../services/uazapi.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Main UAZAPI webhook handler
 * Handles: messages, messages_update, connection events
 */
export async function handleUazapiWebhook(req: Request, res: Response) {
    console.log('================= INCOMING UAZAPI WEBHOOK =================');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('============================================================');

    try {
        // ---- messages_update: status updates (sent, delivered, read) ----
        if (req.body.EventType === 'messages_update') {
            const event = req.body.event;
            if (!event || !event.MessageIDs || !event.MessageIDs.length || !event.Type) {
                res.status(200).json({ success: true, message: 'Invalid status update' });
                return;
            }

            const messageId = event.MessageIDs[0];
            const status = event.Type.toLowerCase();

            const statusMap: Record<string, string> = {
                sent: 'sent',
                delivered: 'delivered',
                read: 'read',
                failed: 'failed',
            };

            const mappedStatus = statusMap[status] || 'pending';

            const messageRow = await prisma.message.updateMany({
                where: { externalId: messageId },
                data: { status: mappedStatus as any },
            });

            if (messageRow.count > 0) {
                const dbMessage = await prisma.message.findFirst({
                    where: { externalId: messageId },
                    select: { conversationId: true },
                });

                if (dbMessage && socketService) {
                    socketService.emitMessageStatus(dbMessage.conversationId, messageId, mappedStatus);
                }
            }

            res.status(200).json({ success: true, message: 'Status updated' });
            return;
        }

        // ---- connection: status changes (connected/disconnected) ----
        const isConnectionEvent =
            req.body.EventType === 'connection_update' ||
            req.body.EventType === 'connection.update' ||
            req.body.EventType === 'connection' ||
            req.body.event === 'connection.update' ||
            req.body.event === 'connection_update' ||
            req.body.data?.event === 'connection.update' ||
            (req.body.event === 'status.instance' && req.body.data);

        if (isConnectionEvent) {
            const instanceName = req.body.instanceName || req.body.instance?.name ||
                req.body.data?.instance || req.body.sender?.split('@')?.[0];
            const state = req.body.instance?.status || req.body.data?.state || req.body.state ||
                req.body.data?.status || req.body.status;

            logger.info(`Connection event: instance=${instanceName}, state=${state}`);

            if (state) {
                let newStatus: 'connected' | 'disconnected' | 'pending' | 'banned' = 'pending';
                if (state === 'open' || state === 'connected') newStatus = 'connected';
                else if (state === 'close' || state === 'closed' || state === 'disconnected' || state === 'refused') newStatus = 'disconnected';

                if (instanceName) {
                    const updated = await prisma.whatsappConnection.updateMany({
                        where: { instanceId: instanceName },
                        data: { status: newStatus as any }
                    });
                    if (updated.count > 0) {
                        logger.info(`Updated connection status for ${instanceName} to ${newStatus}`);

                        // Emit via Socket.io so frontend reacts instantly
                        const conn = await prisma.whatsappConnection.findFirst({
                            where: { instanceId: instanceName },
                            select: { id: true, tenantId: true }
                        });
                        if (conn && socketService) {
                            socketService.emitToTenant(conn.tenantId, 'whatsapp:status', {
                                connectionId: conn.id,
                                instanceName,
                                status: newStatus
                            });
                        }
                    } else {
                        logger.warn(`No DB connection found for instanceId: ${instanceName}`);
                    }
                }
            }
            res.status(200).json({ success: true, message: 'Connection updated' });
            return;
        }

        // ---- messages: new incoming messages ----
        const message = uazapiService.parseWebhookMessage(req.body);

        if (!message) {
            res.status(200).json({ success: true, message: 'Ignored' });
            return;
        }

        // Skip group messages
        if (message.isGroup) {
            res.status(200).json({ success: true, message: 'Group message ignored' });
            return;
        }

        // Find connection by instance ID
        const connection = await prisma.whatsappConnection.findFirst({
            where: { instanceId: message.instanceId },
            include: { tenant: true },
        });

        if (!connection) {
            logger.warn(`No connection found for instance: ${message.instanceId}`);
            res.status(200).json({ success: true, message: 'No connection found' });
            return;
        }

        const tenantId = connection.tenantId;

        // Find or create conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                tenantId,
                contactPhone: message.phone,
                whatsappConnectionId: connection.id,
            },
            include: { lead: true },
        });

        // Update contactLid if needed
        if (conversation && message.chatLid && (conversation as any).contactLid !== message.chatLid) {
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { contactLid: message.chatLid } as any
            });
        }

        if (!conversation) {
            // Find or create lead
            let lead = await prisma.lead.findFirst({
                where: { tenantId, phone: message.phone },
            });

            if (!lead) {
                // Find first funnel + stage for this tenant to use as default
                const defaultFunnel = await prisma.funnel.findFirst({
                    where: { tenantId },
                });

                if (!defaultFunnel) {
                    logger.error(`No funnel found for tenant ${tenantId}, cannot create lead`);
                    res.status(200).json({ success: true, message: 'No funnel configured' });
                    return;
                }

                const defaultStage = await prisma.funnelStage.findFirst({
                    where: { funnelId: defaultFunnel.id },
                    orderBy: { orderIndex: 'asc' },
                });

                if (!defaultStage) {
                    logger.error(`No stage found for funnel ${defaultFunnel.id}, cannot create lead`);
                    res.status(200).json({ success: true, message: 'No stage configured' });
                    return;
                }

                lead = await prisma.lead.create({
                    data: {
                        tenantId,
                        funnelId: defaultFunnel.id,
                        stageId: defaultStage.id,
                        name: (!message.fromMe && message.senderName) ? message.senderName : (message.contactName || message.phone),
                        phone: message.phone,
                        avatarUrl: message.avatarUrl || null,
                    },
                });
            }

            // Create conversation
            conversation = await prisma.conversation.create({
                data: {
                    tenantId,
                    leadId: lead.id,
                    whatsappConnectionId: connection.id,
                    contactPhone: message.phone,
                    contactLid: message.chatLid || null,
                    status: 'ai_handling',
                } as any,
                include: { lead: true },
            });

            if (socketService) {
                socketService.emitNewConversation(tenantId, conversation);
            }
        }

        // Always update the lead's avatar if the latest payload provides a new one
        if (message.avatarUrl && (conversation as any).lead) {
            const currentLead = (conversation as any).lead;
            if (currentLead.avatarUrl !== message.avatarUrl) {
                await prisma.lead.update({
                    where: { id: currentLead.id },
                    data: { avatarUrl: message.avatarUrl }
                });
            }
        }

        // Check for duplicate messages
        const existingMessage = await prisma.message.findFirst({
            where: { externalId: message.messageId },
        });

        if (existingMessage) {
            res.status(200).json({ success: true, message: 'Duplicate message' });
            return;
        }

        // Fetch media dynamically if missing
        if (!message.mediaUrl && ['audio', 'video', 'image', 'document'].includes(message.contentType)) {
            try {
                const { uazapiService } = await import('../../services/uazapi.service.js');
                const mediaLink = await uazapiService.getMediaLinkFromWebhookMessage(message.instanceId, connection.instanceToken || '', message.messageId);
                if (mediaLink) {
                    message.mediaUrl = mediaLink;
                }
            } catch (mediaErr) {
                logger.error('Failed to dynamically fetch media link for webhook', mediaErr);
            }
        }

        // Create message
        const dbMessage = await prisma.message.create({
            data: {
                tenantId,
                conversationId: conversation.id,
                externalId: message.messageId,
                direction: message.fromMe ? 'outbound' : 'inbound',
                senderType: message.fromMe ? 'agent' : 'client',
                content: message.content || '',
                contentType: (message.contentType || 'text') as any,
                mediaUrl: message.mediaUrl || null,
                status: message.fromMe ? 'sent' : 'delivered',
            } as any,
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                lastMessageAt: new Date(),
                unreadCount: message.fromMe ? undefined : { increment: 1 },
            },
        });

        // Emit to socket
        if (socketService) {
            socketService.emitNewMessage(conversation.id, dbMessage);
            socketService.emitConversationUpdate(tenantId, {
                ...conversation,
                lastMessageAt: new Date().toISOString(),
            });
        }

        // ============================================
        // AI AGENT EXTERNAL WEBHOOK DISPATCH
        // ============================================
        if (!message.fromMe && message.content) {
            try {
                // Find active AI Agents for this tenant with a configured webhook
                const activeAgents = await prisma.aiAgent.findMany({
                    where: { tenantId, isActive: true, webhookUrl: { not: null } }
                });

                for (const agent of activeAgents) {
                    if (agent.webhookUrl) {
                        const payload = {
                            session: connection.name || message.instanceId,
                            text: message.content,
                            number: message.phone,
                            agentName: agent.name
                        };

                        // Fire and forget fetch request
                        fetch(agent.webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        }).catch(reqErr => {
                            logger.error(`[AI Agent Webhook] Failed to send payload to ${agent.name} at ${agent.webhookUrl}: ${reqErr.message}`);
                        });
                    }
                }
            } catch (err) {
                logger.error('[AI Agent Webhook] Error fetching agents or dispatching', err);
            }
        }

        res.status(200).json({ success: true, message: 'Message processed' });
    } catch (error: any) {
        logger.error('Webhook processing error:', error);
        res.status(200).json({ success: true, message: 'Error processing' });
    }
}
