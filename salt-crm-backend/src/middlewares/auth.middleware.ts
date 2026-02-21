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

        const user = await prisma.user.findUnique({
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
            throw new UnauthorizedError('Usuário não encontrado');
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
