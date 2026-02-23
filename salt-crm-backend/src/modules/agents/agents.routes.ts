import { Router } from 'express';
import { agentsController } from './agents.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', agentsController.findAll);
router.get('/:id', agentsController.findById);
router.post('/', agentsController.create);
router.put('/:id', agentsController.update);
router.delete('/:id', agentsController.delete);

export const agentsRouter = router;
