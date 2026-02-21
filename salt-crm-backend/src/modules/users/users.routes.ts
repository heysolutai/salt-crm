import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
    createUserSchema,
    updateUserSchema,
    listUsersQuerySchema,
    userIdParamSchema
} from './users.schema.js';

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

router.get(
    '/',
    validate({ query: listUsersQuerySchema }),
    usersController.findAll
);

router.get(
    '/:id',
    validate({ params: userIdParamSchema }),
    usersController.findById
);

router.post(
    '/',
    validate({ body: createUserSchema }),
    usersController.create
);

router.put(
    '/:id',
    validate({ params: userIdParamSchema, body: updateUserSchema }),
    usersController.update
);

router.delete(
    '/:id',
    validate({ params: userIdParamSchema }),
    usersController.delete
);

export { router as usersRoutes };
