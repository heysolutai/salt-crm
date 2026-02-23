import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import type { LoginInput, RefreshInput, ChangePasswordInput } from './auth.schema.js';

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as LoginInput;
            const result = await authService.login(data);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async superAdminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as LoginInput;
            const result = await authService.superAdminLogin(data);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refresh_token } = req.body as RefreshInput;
            const result = await authService.refresh(refresh_token);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await authService.logout(req.user!.id);

            res.status(200).json({ message: 'Logout realizado com sucesso' });
        } catch (error) {
            next(error);
        }
    }

    async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await authService.getMe(req.user!.id);

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as ChangePasswordInput;
            await authService.changePassword(req.user!.id, data);

            res.status(200).json({ message: 'Senha alterada com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
