import { Router } from 'express';
import { whatsappController } from './whatsapp.controller.js';
import { authMiddleware as authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// Protected routes (require auth)
router.get('/', authenticate, whatsappController.list);
router.post('/instance', authenticate, whatsappController.createInstance);
router.get('/:id/connect', authenticate, whatsappController.connect);

// Public routes (webhooks)
router.post('/webhook', whatsappController.webhook);
router.delete('/:id', authenticate, whatsappController.deleteInstance);

export const whatsappRoutes = router;
