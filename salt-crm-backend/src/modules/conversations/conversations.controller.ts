import { Request, Response, NextFunction } from 'express';
import { conversationsService } from './conversations.service.js';
import type {
    ListConversationsQuery,
    UpdateConversationInput,
    TransferConversationInput,
    SendMessageInput,
    ListMessagesQuery,
} from './conversations.schema.js';

export class ConversationsController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query as unknown as ListConversationsQuery;
            const result = await conversationsService.findAll(req.user!, query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const conversation = await conversationsService.findById(req.user!, req.params.id);
            res.status(200).json(conversation);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as UpdateConversationInput;
            const conversation = await conversationsService.update(req.user!, req.params.id, data);
            res.status(200).json(conversation);
        } catch (error) {
            next(error);
        }
    }

    async transfer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as TransferConversationInput;
            const conversation = await conversationsService.transfer(req.user!, req.params.id, data);
            res.status(200).json(conversation);
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const conversation = await conversationsService.markAsRead(req.user!, req.params.id);
            res.status(200).json(conversation);
        } catch (error) {
            next(error);
        }
    }

    async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query as unknown as ListMessagesQuery;
            const messages = await conversationsService.getMessages(req.user!, req.params.id, query);
            res.status(200).json(messages);
        } catch (error) {
            next(error);
        }
    }

    async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as SendMessageInput;
            const message = await conversationsService.sendMessage(req.user!, req.params.id, data);
            res.status(201).json(message);
        } catch (error) {
            next(error);
        }
    }
}

export const conversationsController = new ConversationsController();
