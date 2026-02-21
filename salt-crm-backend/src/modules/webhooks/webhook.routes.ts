import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { socketService } from '../../config/socket.js';
import { uazapiService } from '../../services/uazapi.service.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

const router = Router();

// Internal API key middleware
const verifyInternalKey = (req: Request, res: Response, next: Function) => {
    // If no key is configured in .env, allow requests through (common for external webhooks like UAZAPI)
    if (!env.INTERNAL_API_KEY) {
        return next();
    }

    const apiKey = req.headers['x-internal-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey || apiKey !== env.INTERNAL_API_KEY) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    next();
};

// UAZAPI Webhook - receives messages from WhatsApp
router.post('/uazapi/webhook', async (req: Request, res: Response) => {
    console.log('================= INCOMING UAZAPI WEBHOOK PAYLOAD =================');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('===================================================================');
    try {
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

        // Find WhatsApp connection
        const connection = await prisma.whatsappConnection.findFirst({
            where: { instanceId: message.instanceId },
            include: { tenant: true },
        });

        if (!connection) {
            logger.warn(`Unknown WhatsApp instance: ${message.instanceId}`);
            res.status(200).json({ success: true, message: 'Unknown instance' });
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

        if (!conversation) {
            // Try to find lead by phone
            let lead = await prisma.lead.findFirst({
                where: { tenantId, phone: message.phone },
            });

            // If no lead exists, create one
            if (!lead) {
                const defaultFunnel = await prisma.funnel.findFirst({
                    where: { tenantId, isDefault: true },
                    include: { stages: { where: { isEntry: true }, take: 1 } },
                });

                if (!defaultFunnel || defaultFunnel.stages.length === 0) {
                    logger.error(`No default funnel/entry stage for tenant ${tenantId}`);
                    res.status(200).json({ success: true, message: 'No default funnel' });
                    return;
                }

                lead = await prisma.lead.create({
                    data: {
                        tenantId,
                        name: message.senderName || message.phone,
                        phone: message.phone,
                        funnelId: defaultFunnel.id,
                        stageId: defaultFunnel.stages[0].id,
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
                    status: 'ai_handling',
                },
                include: { lead: true },
            });

            // Emit new conversation event
            if (socketService) {
                socketService.emitNewConversation(tenantId, conversation);
            }
        }

        // Create message in database
        const dbMessage = await prisma.message.create({
            data: {
                tenantId,
                conversationId: conversation.id,
                direction: 'inbound',
                senderType: 'client',
                content: message.content,
                contentType: message.contentType,
                mediaUrl: message.mediaUrl,
                externalId: message.messageId,
                status: 'delivered',
            },
            select: {
                id: true,
                direction: true,
                senderType: true,
                content: true,
                contentType: true,
                mediaUrl: true,
                status: true,
                createdAt: true,
            },
        });

        // Update conversation
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                lastMessageAt: new Date(),
                unreadCount: { increment: 1 },
            },
        });

        // Update lead interaction
        if (conversation.lead) {
            await prisma.lead.update({
                where: { id: conversation.lead.id },
                data: {
                    lastInteractionAt: new Date(),
                    interactionCount: { increment: 1 },
                    // First response time
                    firstResponseAt: conversation.lead.firstResponseAt || new Date(),
                },
            });
        }

        // Emit new message event
        if (socketService) {
            socketService.emitNewMessage(conversation.id, dbMessage);
        }

        logger.info(`Incoming message from ${message.phone} saved`);

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal error' });
    }
});

// Webhook for message status updates
router.post('/uazapi/status', async (req: Request, res: Response) => {
    try {
        const { messageId, status } = req.body;

        if (!messageId || !status) {
            res.status(400).json({ error: 'Missing messageId or status' });
            return;
        }

        // Map UAZAPI status to our status
        const statusMap: Record<string, string> = {
            sent: 'sent',
            delivered: 'delivered',
            read: 'read',
            failed: 'failed',
        };

        const mappedStatus = statusMap[status] || 'pending';

        // Update message status
        const message = await prisma.message.updateMany({
            where: { externalId: messageId },
            data: { status: mappedStatus as any },
        });

        if (message.count > 0) {
            // Get conversation to emit event
            const dbMessage = await prisma.message.findFirst({
                where: { externalId: messageId },
                select: { conversationId: true },
            });

            if (dbMessage && socketService) {
                socketService.emitMessageStatus(dbMessage.conversationId, messageId, mappedStatus);
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error('Status webhook error:', error);
        res.status(500).json({ error: 'Internal error' });
    }
});

// Connection status webhook
router.post('/uazapi/connection', async (req: Request, res: Response) => {
    try {
        const { instanceId, status, qrCode } = req.body;

        const statusMap: Record<string, string> = {
            connected: 'connected',
            disconnected: 'disconnected',
            pending: 'pending',
        };

        await prisma.whatsappConnection.updateMany({
            where: { instanceId },
            data: {
                status: statusMap[status] as any || 'pending',
                qrCode: qrCode || null,
                lastConnectedAt: status === 'connected' ? new Date() : undefined,
                lastDisconnectedAt: status === 'disconnected' ? new Date() : undefined,
            },
        });

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error('Connection webhook error:', error);
        res.status(500).json({ error: 'Internal error' });
    }
});

export { router as webhookRoutes };
