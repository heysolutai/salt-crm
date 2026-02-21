import { Router } from 'express';
import { funnelsController } from './funnels.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireAdmin, requireManager } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import z from 'zod';
import {
    createFunnelSchema,
    updateFunnelSchema,
    funnelIdParamSchema,
    createStageSchema,
    updateStageSchema,
    stageIdParamSchema,
    reorderStagesSchema,
} from './funnels.schema.js';

const stageParamsSchema = funnelIdParamSchema.merge(stageIdParamSchema);

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ============== FUNNEL ROUTES ==============

// List funnels - accessible by all authenticated users
router.get('/', funnelsController.findAll);

// Get funnel by ID
router.get('/:id', validate({ params: funnelIdParamSchema }), funnelsController.findById);

// Create funnel - admin/manager only
router.post(
    '/',
    requireManager,
    validate({ body: createFunnelSchema }),
    funnelsController.create
);

// Update funnel - admin/manager only
router.put(
    '/:id',
    requireManager,
    validate({ params: funnelIdParamSchema, body: updateFunnelSchema }),
    funnelsController.update
);

// Delete funnel - admin only
router.delete(
    '/:id',
    requireAdmin,
    validate({ params: funnelIdParamSchema }),
    funnelsController.delete
);

// ============== STAGE ROUTES ==============

// Create stage
router.post(
    '/:id/stages',
    requireManager,
    validate({ params: funnelIdParamSchema, body: createStageSchema }),
    funnelsController.createStage
);

// Update stage
router.put(
    '/:id/stages/:stageId',
    requireManager,
    validate({ params: stageParamsSchema, body: updateStageSchema }),
    funnelsController.updateStage
);

// Delete stage
router.delete(
    '/:id/stages/:stageId',
    requireAdmin,
    validate({ params: stageParamsSchema }),
    funnelsController.deleteStage
);

// Reorder stages
router.patch(
    '/:id/stages/reorder',
    requireManager,
    validate({ params: funnelIdParamSchema, body: reorderStagesSchema }),
    funnelsController.reorderStages
);

export { router as funnelsRoutes };
