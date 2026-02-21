import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorMiddleware(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Log the error
    if (error instanceof AppError && error.isOperational) {
        logger.warn(`${error.code}: ${error.message}`);
    } else {
        logger.error('Unexpected error:', error);
    }

    // Handle AppError (our custom errors)
    if (error instanceof AppError) {
        const response: Record<string, unknown> = {
            error: {
                code: error.code,
                message: error.message,
            },
        };

        // Add validation errors if present
        if (error instanceof ValidationError) {
            response.error = {
                ...response.error as object,
                details: error.errors,
            };
        }

        // Add stack trace in development
        if (env.NODE_ENV === 'development') {
            response.error = {
                ...response.error as object,
                stack: error.stack,
            };
        }

        res.status(error.statusCode).json(response);
        return;
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = handlePrismaError(error);
        res.status(prismaError.statusCode).json({
            error: {
                code: prismaError.code,
                message: prismaError.message,
            },
        });
        return;
    }

    // Handle unknown errors
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: env.NODE_ENV === 'production'
                ? 'Erro interno do servidor'
                : error.message,
            ...(env.NODE_ENV === 'development' && { stack: error.stack }),
        },
    });
}

function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    code: string;
    message: string;
} {
    switch (error.code) {
        case 'P2002':
            return {
                statusCode: 409,
                code: 'DUPLICATE_ENTRY',
                message: 'Registro já existe com esses dados',
            };
        case 'P2025':
            return {
                statusCode: 404,
                code: 'NOT_FOUND',
                message: 'Registro não encontrado',
            };
        case 'P2003':
            return {
                statusCode: 400,
                code: 'FOREIGN_KEY_ERROR',
                message: 'Referência inválida para outro registro',
            };
        default:
            return {
                statusCode: 500,
                code: 'DATABASE_ERROR',
                message: 'Erro no banco de dados',
            };
    }
}

// Handle 404 for unknown routes
export function notFoundMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: `Rota não encontrada: ${req.method} ${req.path}`,
        },
    });
}
