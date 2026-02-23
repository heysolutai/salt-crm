import { Request, Response, NextFunction } from 'express';
import { agentsService } from './agents.service.js';
import { createAgentSchema, updateAgentSchema, type CreateAgentInput, type UpdateAgentInput } from './agents.schema.js';

export class AgentsController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const agents = await agentsService.findAll(req.user!);
            res.status(200).json(agents);
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const agent = await agentsService.findById(req.user!, req.params.id);
            res.status(200).json(agent);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = createAgentSchema.parse(req.body);
            const agent = await agentsService.create(req.user!, data);
            res.status(201).json(agent);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = updateAgentSchema.parse(req.body);
            const agent = await agentsService.update(req.user!, req.params.id, data);
            res.status(200).json(agent);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await agentsService.delete(req.user!, req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export const agentsController = new AgentsController();
