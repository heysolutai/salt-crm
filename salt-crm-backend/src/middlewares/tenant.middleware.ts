import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors.js';

export function tenantMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        // tenantId is set by authMiddleware
        if (!req.tenantId) {
            throw new BadRequestError('Tenant não identificado');
        }

        next();
    } catch (error) {
        next(error);
    }
}

// For webhooks that receive tenantId from external sources
export function webhookTenantMiddleware(headerName: string = 'x-tenant-id') {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const tenantId = req.headers[headerName] as string;

            if (!tenantId) {
                throw new BadRequestError('Tenant não identificado no header');
            }

            req.tenantId = tenantId;
            next();
        } catch (error) {
            next(error);
        }
    };
}
