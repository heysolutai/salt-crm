import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    phone: z.string().optional(),
    role: z.enum(['admin', 'manager', 'agent']).default('agent'),
    teamId: z.string().uuid().optional().nullable(),
    managerId: z.string().uuid().optional().nullable(),
    weight: z.number().int().min(1).max(10).default(1),
    receivesLeads: z.boolean().default(true),
    maxLeadsPerDay: z.number().int().min(1).optional().nullable(),
    workingHoursStart: z.string().regex(/^\d{2}:\d{2}$/).default('08:00'),
    workingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).default('18:00'),
    workingDays: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const listUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    role: z.enum(['admin', 'manager', 'agent']).optional(),
    teamId: z.string().uuid().optional(),
    isActive: z.coerce.boolean().optional(),
});

export const userIdParamSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
