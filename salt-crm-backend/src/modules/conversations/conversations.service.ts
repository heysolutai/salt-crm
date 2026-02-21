import { prisma } from '../../config/database.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { paginate } from '../../utils/helpers.js';
import type { AuthUser } from '../../types/express.js';
import type {
    ListConversationsQuery,
    UpdateConversationInput,
    TransferConversationInput,
    SendMessageInput,
    ListMessagesQuery,
} from './conversations.schema.js';

export class ConversationsService {
    // Common select for conversation list
    private readonly conversationSelect = {
        id: true,
        whatsappPhone: true,
        status: true,
        aiEnabled: true,
        unreadCount: true,
        lastMessageAt: true,
        createdAt: true,
        lead: {
            select: {
                id: true,
                name: true,
                phone: true,
                avatarUrl: true,
                temperature: true,
            },
        },
        assignedTo: {
            select: { id: true, name: true, avatarUrl: true },
        },
        whatsappConnection: {
            select: { id: true, phoneNumber: true, name: true },
        },
        _count: {
            select: { messages: true },
        },
    };

    // Build where clause based on role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private buildWhereClause(authUser: AuthUser, query: ListConversationsQuery): Record<string, any> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = {
            tenantId: authUser.tenantId,
        };

        // Role-based filtering
        if (authUser.role === 'agent') {
            where.assignedToId = authUser.id;
        } else if (authUser.role === 'manager') {
            where.OR = [
                { assignedToId: authUser.id },
                { lead: { teamId: authUser.teamId } },
                { lead: { assignedTo: { managerId: authUser.id } } },
            ];
        }

        // Filters
        if (query.status) where.status = query.status;
        if (query.assignedToId) where.assignedToId = query.assignedToId;
        if (query.leadId) where.leadId = query.leadId;

        // Search
        if (query.search) {
            where.AND = [
                {
                    OR: [
                        { lead: { name: { contains: query.search, mode: 'insensitive' } } },
                        { whatsappPhone: { contains: query.search } },
                    ],
                },
            ];
        }

        return where;
    }

    async findAll(authUser: AuthUser, query: ListConversationsQuery) {
        const { page, limit } = query;
        const where = this.buildWhereClause(authUser, query);

        const [conversations, total] = await Promise.all([
            prisma.conversation.findMany({
                where,
                select: this.conversationSelect,
                orderBy: [
                    { isPinned: 'desc' },
                    { lastMessageAt: 'desc' },
                ],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.conversation.count({ where }),
        ]);

        return paginate(conversations, page, limit, total);
    }

    async findById(authUser: AuthUser, id: string) {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                tenantId: authUser.tenantId,
            },
            include: {
                lead: true,
                assignedTo: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
                whatsappConnection: true,
                pinnedBy: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!conversation) {
            throw new NotFoundError('Conversa não encontrada');
        }

        // Check access
        if (authUser.role === 'agent' && conversation.assignedToId !== authUser.id) {
            throw new ForbiddenError('Acesso negado a esta conversa');
        }

        return conversation;
    }

    async update(authUser: AuthUser, id: string, data: UpdateConversationInput) {
        await this.findById(authUser, id);

        // Build update data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = {};

        if (data.status !== undefined) updateData.status = data.status;
        if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
        if (data.aiEnabled !== undefined) updateData.aiEnabled = data.aiEnabled;
        if (data.isPinned !== undefined) {
            updateData.isPinned = data.isPinned;
            updateData.pinnedById = data.isPinned ? authUser.id : null;
        }

        return prisma.conversation.update({
            where: { id },
            data: updateData,
            select: this.conversationSelect,
        });
    }

    async transfer(authUser: AuthUser, id: string, data: TransferConversationInput) {
        // Only manager/admin can transfer
        if (authUser.role === 'agent') {
            throw new ForbiddenError('Apenas gerentes podem transferir conversas');
        }

        await this.findById(authUser, id);

        const conversation = await prisma.conversation.update({
            where: { id },
            data: {
                assignedToId: data.toUserId,
                status: 'manual',
            },
            select: this.conversationSelect,
        });

        // Create history entry for lead
        const lead = await prisma.lead.findUnique({ where: { id: conversation.lead.id } });
        if (lead) {
            const toUser = await prisma.user.findUnique({
                where: { id: data.toUserId },
                select: { name: true }
            });

            await prisma.leadHistory.create({
                data: {
                    tenantId: authUser.tenantId,
                    leadId: lead.id,
                    eventType: 'transfer',
                    title: `Conversa transferida para ${toUser?.name}`,
                    description: data.notes,
                    createdById: authUser.id,
                },
            });
        }

        return conversation;
    }

    async markAsRead(authUser: AuthUser, id: string) {
        await this.findById(authUser, id);

        return prisma.conversation.update({
            where: { id },
            data: { unreadCount: 0 },
            select: this.conversationSelect,
        });
    }

    // ============== MESSAGES ==============

    async getMessages(authUser: AuthUser, conversationId: string, query: ListMessagesQuery) {
        await this.findById(authUser, conversationId);

        const where: Record<string, unknown> = { conversationId };
        if (query.before) {
            where.createdAt = { lt: new Date(query.before) };
        }

        return prisma.message.findMany({
            where,
            select: {
                id: true,
                direction: true,
                senderType: true,
                content: true,
                contentType: true,
                mediaUrl: true,
                status: true,
                createdAt: true,
                sentBy: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: query.limit,
        });
    }

    async sendMessage(authUser: AuthUser, conversationId: string, data: SendMessageInput) {
        const conversation = await this.findById(authUser, conversationId);

        // Create message in database
        const message = await prisma.message.create({
            data: {
                tenantId: authUser.tenantId,
                conversationId,
                direction: 'outbound',
                senderType: 'agent',
                sentById: authUser.id,
                content: data.content,
                contentType: data.contentType,
                mediaUrl: data.mediaUrl,
                status: 'pending',
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
                sentBy: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });

        // Update conversation
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessageAt: new Date(),
                status: 'manual',
            },
        });

        // Update lead interaction
        await prisma.lead.update({
            where: { id: conversation.lead.id },
            data: {
                lastInteractionAt: new Date(),
                interactionCount: { increment: 1 },
            },
        });

        // Integrate with UAZAPI
        if (conversation.whatsappConnection?.instanceId) {
            const { whatsappService } = await import('../whatsapp/whatsapp.service.js');
            await whatsappService.sendMessage(
                conversation.whatsappConnection.instanceId,
                conversation.lead.phone, // Ensure phone is in correct format (55...)
                data.content
            );
        }

        return message;
    }
}

export const conversationsService = new ConversationsService();
