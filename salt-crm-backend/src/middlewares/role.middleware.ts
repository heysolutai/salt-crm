import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export function requireRole(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new UnauthorizedError('Não autenticado');
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new ForbiddenError(
                    `Permissão negada. Roles permitidos: ${allowedRoles.join(', ')}`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

// Shortcut for admin only
export const requireAdmin = requireRole('admin');

// Shortcut for admin and manager
export const requireManager = requireRole('admin', 'manager');
