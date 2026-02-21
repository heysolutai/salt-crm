import { Router } from 'express';
import { leadsController } from './leads.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireManager } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
    createLeadSchema,
    updateLeadSchema,
    moveLeadSchema,
    assignLeadSchema,
    listLeadsQuerySchema,
    leadIdParamSchema,
} from './leads.schema.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// List leads (filtered by role automatically)
router.get(
    '/',
    validate({ query: listLeadsQuerySchema }),
    leadsController.findAll
);

// Get lead by ID
router.get(
    '/:id',
    validate({ params: leadIdParamSchema }),
    leadsController.findById
);

// Get lead history
router.get(
    '/:id/history',
    validate({ params: leadIdParamSchema }),
    leadsController.getHistory
);

// Get lead stage history
router.get(
    '/:id/stage-history',
    validate({ params: leadIdParamSchema }),
    leadsController.getStageHistory
);

// Create lead
router.post(
    '/',
    validate({ body: createLeadSchema }),
    leadsController.create
);

// Update lead
router.put(
    '/:id',
    validate({ params: leadIdParamSchema, body: updateLeadSchema }),
    leadsController.update
);

// Move lead to another stage
router.patch(
    '/:id/move',
    validate({ params: leadIdParamSchema, body: moveLeadSchema }),
    leadsController.moveStage
);

// Assign lead to user/team (manager/admin only)
router.patch(
    '/:id/assign',
    requireManager,
    validate({ params: leadIdParamSchema, body: assignLeadSchema }),
    leadsController.assign
);

export { router as leadsRoutes };
