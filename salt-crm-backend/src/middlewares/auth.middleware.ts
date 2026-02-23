import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../config/jwt.js';
import { prisma } from '../config/database.js';
import { UnauthorizedError } from '../utils/errors.js';
import { AuthUser } from '../types/express.js';

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Token não fornecido');
        }

        const token = authHeader.split(' ')[1];

        let decoded: JwtPayload;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            throw new UnauthorizedError('Token inválido ou expirado');
        }

        if (decoded.type === 'refresh') {
            throw new UnauthorizedError('Token de refresh não pode ser usado para autenticação');
        }

        let user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                tenantId: true,
                teamId: true,
                isActive: true,
            },
        });

        if (!user) {
            // Fallback: check if it's a SuperAdmin
            const admin = await prisma.superAdminUser.findUnique({
                where: { id: decoded.sub },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                },
            });

            if (!admin) {
                throw new UnauthorizedError('Usuário não encontrado');
            }

            if (!admin.isActive) {
                throw new UnauthorizedError('Usuário desativado');
            }

            // Build a compatible user object for SuperAdmin
            req.user = {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role as string,
                tenantId: 'master-tenant',
                teamId: null,
                isActive: admin.isActive,
            } as unknown as AuthUser;
            req.tenantId = 'master-tenant';

            return next();
        }

        if (!user.isActive) {
            throw new UnauthorizedError('Usuário desativado');
        }

        req.user = user as AuthUser;
        req.tenantId = user.tenantId;

        next();
    } catch (error) {
        next(error);
    }
}

// Optional auth - doesn't throw if no token
export async function optionalAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        await authMiddleware(req, res, next);
    } catch {
        // Ignore auth errors for optional auth
        next();
    }
}
