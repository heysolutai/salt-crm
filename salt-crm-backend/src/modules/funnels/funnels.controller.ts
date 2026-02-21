import { Request, Response, NextFunction } from 'express';
import { funnelsService } from './funnels.service.js';
import type {
    CreateFunnelInput,
    UpdateFunnelInput,
    CreateStageInput,
    UpdateStageInput,
    ReorderStagesInput
} from './funnels.schema.js';

export class FunnelsController {
    // ============== FUNNEL ENDPOINTS ==============

    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const funnels = await funnelsService.findAll(req.user!);
            res.status(200).json(funnels);
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const funnel = await funnelsService.findById(req.user!, req.params.id);
            res.status(200).json(funnel);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as CreateFunnelInput;
            const funnel = await funnelsService.create(req.user!, data);
            res.status(201).json(funnel);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as UpdateFunnelInput;
            const funnel = await funnelsService.update(req.user!, req.params.id, data);
            res.status(200).json(funnel);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await funnelsService.delete(req.user!, req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    // ============== STAGE ENDPOINTS ==============

    async createStage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as CreateStageInput;
            const stage = await funnelsService.createStage(req.user!, req.params.id, data);
            res.status(201).json(stage);
        } catch (error) {
            next(error);
        }
    }

    async updateStage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as UpdateStageInput;
            const stage = await funnelsService.updateStage(req.user!, req.params.id, req.params.stageId, data);
            res.status(200).json(stage);
        } catch (error) {
            next(error);
        }
    }

    async deleteStage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await funnelsService.deleteStage(req.user!, req.params.id, req.params.stageId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async reorderStages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as ReorderStagesInput;
            const funnel = await funnelsService.reorderStages(req.user!, req.params.id, data);
            res.status(200).json(funnel);
        } catch (error) {
            next(error);
        }
    }
}

export const funnelsController = new FunnelsController();
