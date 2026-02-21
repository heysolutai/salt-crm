import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors.js';

interface ValidateOptions {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export function validate(schemas: ValidateOptions) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const errors: Record<string, string[]> = {};

            if (schemas.body) {
                const result = schemas.body.safeParse(req.body);
                if (!result.success) {
                    errors.body = formatZodErrors(result.error);
                } else {
                    req.body = result.data;
                }
            }

            if (schemas.query) {
                const result = schemas.query.safeParse(req.query);
                if (!result.success) {
                    errors.query = formatZodErrors(result.error);
                } else {
                    req.query = result.data;
                }
            }

            if (schemas.params) {
                const result = schemas.params.safeParse(req.params);
                if (!result.success) {
                    errors.params = formatZodErrors(result.error);
                } else {
                    req.params = result.data;
                }
            }

            if (Object.keys(errors).length > 0) {
                throw new ValidationError(errors);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

function formatZodErrors(error: ZodError): string[] {
    return error.errors.map((err) => {
        const path = err.path.join('.');
        return path ? `${path}: ${err.message}` : err.message;
    });
}
