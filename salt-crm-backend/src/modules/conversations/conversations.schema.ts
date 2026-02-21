import { z } from 'zod';

// ============== CONVERSATION SCHEMAS ==============

export const listConversationsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    status: z.enum(['ai_handling', 'manual', 'waiting', 'closed']).optional(),
    assignedToId: z.string().uuid().optional(),
    leadId: z.string().uuid().optional(),
    search: z.string().optional(),
});

export const conversationIdParamSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

export const updateConversationSchema = z.object({
    status: z.enum(['ai_handling', 'manual', 'waiting', 'closed']).optional(),
    assignedToId: z.string().uuid().optional().nullable(),
    aiEnabled: z.boolean().optional(),
    isPinned: z.boolean().optional(),
});

export const transferConversationSchema = z.object({
    toUserId: z.string().uuid(),
    notes: z.string().optional(),
});

// ============== MESSAGE SCHEMAS ==============

export const sendMessageSchema = z.object({
    content: z.string().min(1, 'Mensagem não pode ser vazia'),
    contentType: z.enum(['text', 'image', 'audio', 'video', 'document']).default('text'),
    mediaUrl: z.string().url().optional(),
});

export const listMessagesQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    before: z.string().datetime().optional(),
});

export type ListConversationsQuery = z.infer<typeof listConversationsQuerySchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type TransferConversationInput = z.infer<typeof transferConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
