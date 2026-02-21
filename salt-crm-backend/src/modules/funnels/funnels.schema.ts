import { z } from 'zod';

// ============== FUNNEL SCHEMAS ==============

export const createFunnelSchema = z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    type: z.enum(['sales', 'prospecting', 'portfolio']).default('sales'),
    description: z.string().optional(),
    isDefault: z.boolean().default(false),
});

export const updateFunnelSchema = createFunnelSchema.partial();

export const funnelIdParamSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

// ============== FUNNEL STAGE SCHEMAS ==============

export const createStageSchema = z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um hex válido').default('#6B7280'),
    orderIndex: z.number().int().min(0),
    isEntry: z.boolean().default(false),
    isExit: z.boolean().default(false),
    exitType: z.enum(['won', 'lost', 'archived', 'out_of_profile', 'no_response']).optional().nullable(),
    slaHours: z.number().int().min(1).optional().nullable(),
    autoFollowupHours: z.number().int().min(1).optional().nullable(),
    description: z.string().optional(),
});

export const updateStageSchema = createStageSchema.partial();

export const stageIdParamSchema = z.object({
    stageId: z.string().uuid('ID inválido'),
});

export const reorderStagesSchema = z.object({
    stages: z.array(z.object({
        id: z.string().uuid(),
        orderIndex: z.number().int().min(0),
    })).min(1),
});

export type CreateFunnelInput = z.infer<typeof createFunnelSchema>;
export type UpdateFunnelInput = z.infer<typeof updateFunnelSchema>;
export type CreateStageInput = z.infer<typeof createStageSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;
export type ReorderStagesInput = z.infer<typeof reorderStagesSchema>;
