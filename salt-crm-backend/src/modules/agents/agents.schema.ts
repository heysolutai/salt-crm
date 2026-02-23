import { z } from 'zod';

export const createAgentSchema = z.object({
    name: z.string().min(1, 'Nome do agente é obrigatório'),
    isActive: z.boolean().optional(),
    webhookUrl: z.string().url('URL inválida').or(z.literal('')).optional().transform(v => v || null),
    config: z.record(z.any()).optional(),
});

export const updateAgentSchema = z.object({
    name: z.string().min(1, 'Nome do agente é obrigatório').optional(),
    isActive: z.boolean().optional(),
    webhookUrl: z.string().url('URL inválida').or(z.literal('')).optional().transform(v => v || null),
    config: z.record(z.any()).optional(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
