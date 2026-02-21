import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from './users.schema.js';

export class UsersController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query as unknown as ListUsersQuery;
            const result = await usersService.findAll(req.user!, query);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await usersService.findById(req.user!, req.params.id);

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as CreateUserInput;
            const user = await usersService.create(req.user!, data);

            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as UpdateUserInput;
            const user = await usersService.update(req.user!, req.params.id, data);

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await usersService.delete(req.user!, req.params.id);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export const usersController = new UsersController();
