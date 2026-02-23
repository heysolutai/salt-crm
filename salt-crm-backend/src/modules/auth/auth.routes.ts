import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { loginSchema, refreshSchema, changePasswordSchema } from './auth.schema.js';

const router = Router();

// Public routes
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/superadmin/login', validate({ body: loginSchema }), authController.superAdminLogin);
router.post('/refresh', validate({ body: refreshSchema }), authController.refresh);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);
router.put('/password', authMiddleware, validate({ body: changePasswordSchema }), authController.changePassword);

export { router as authRoutes };
