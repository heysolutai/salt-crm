import { Router, Request, Response } from 'express';
import { whatsappController } from './whatsapp.controller.js';
import { authMiddleware as authenticate } from '../../middlewares/auth.middleware.js';
import { prisma } from '../../config/database.js';
import { socketService } from '../../config/socket.js';
import { uazapiService } from '../../services/uazapi.service.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Protected routes (require auth)
router.get('/', authenticate, whatsappController.list);
router.post('/instance', authenticate, whatsappController.createInstance);
router.get('/:id/connect', authenticate, whatsappController.connect);
router.delete('/:id', authenticate, whatsappController.deleteInstance);

// UAZAPI Webhook - GET for health check / URL verification
router.get('/webhook', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Webhook endpoint active' });
});

// UAZAPI Webhook - POST for receiving events
router.post('/webhook', async (req: Request, res: Response) => {
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
            const instanceName = req.body.instanceName || req.body.instance ||
                req.body.data?.instance || req.body.sender?.split('@')?.[0];
            const state = req.body.data?.state || req.body.state ||
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

        // Find connection by instance name
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

        // Fix type for contactLid by casting
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
                lead = await prisma.lead.create({
                    data: {
                        tenantId,
                        name: message.senderName || message.phone,
                        phone: message.phone,
                    } as any,
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

        // Check for duplicate messages
        const existingMessage = await prisma.message.findFirst({
            where: { externalId: message.messageId },
        });

        if (existingMessage) {
            res.status(200).json({ success: true, message: 'Duplicate message' });
            return;
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

        res.status(200).json({ success: true, message: 'Message processed' });
    } catch (error: any) {
        logger.error('Webhook processing error:', error);
        res.status(200).json({ success: true, message: 'Error processing' });
    }
});

export const whatsappRoutes = router;
