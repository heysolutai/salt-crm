import { Request, Response, NextFunction } from 'express';
import { leadsService } from './leads.service.js';
import type {
    CreateLeadInput,
    UpdateLeadInput,
    MoveLeadInput,
    AssignLeadInput,
    ListLeadsQuery
} from './leads.schema.js';

export class LeadsController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query as unknown as ListLeadsQuery;
            const result = await leadsService.findAll(req.user!, query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const lead = await leadsService.findById(req.user!, req.params.id);
            res.status(200).json(lead);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as CreateLeadInput;
            const lead = await leadsService.create(req.user!, data);
            res.status(201).json(lead);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as UpdateLeadInput;
            const lead = await leadsService.update(req.user!, req.params.id, data);
            res.status(200).json(lead);
        } catch (error) {
            next(error);
        }
    }

    async moveStage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as MoveLeadInput;
            const lead = await leadsService.moveStage(req.user!, req.params.id, data);
            res.status(200).json(lead);
        } catch (error) {
            next(error);
        }
    }

    async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as AssignLeadInput;
            const lead = await leadsService.assign(req.user!, req.params.id, data);
            res.status(200).json(lead);
        } catch (error) {
            next(error);
        }
    }

    async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const history = await leadsService.getHistory(req.user!, req.params.id);
            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }

    async getStageHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const history = await leadsService.getStageHistory(req.user!, req.params.id);
            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }
}

export const leadsController = new LeadsController();
