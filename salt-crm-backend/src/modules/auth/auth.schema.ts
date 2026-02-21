import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const refreshSchema = z.object({
    refresh_token: z.string().min(1, 'Refresh token é obrigatório'),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
    newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
