import { Router } from 'express';
import { conversationsController } from './conversations.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireManager } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
    listConversationsQuerySchema,
    conversationIdParamSchema,
    updateConversationSchema,
    transferConversationSchema,
    sendMessageSchema,
    listMessagesQuerySchema,
} from './conversations.schema.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// List conversations
router.get(
    '/',
    validate({ query: listConversationsQuerySchema }),
    conversationsController.findAll
);

// Get conversation by ID
router.get(
    '/:id',
    validate({ params: conversationIdParamSchema }),
    conversationsController.findById
);

// Update conversation
router.patch(
    '/:id',
    validate({ params: conversationIdParamSchema, body: updateConversationSchema }),
    conversationsController.update
);

// Transfer conversation (manager/admin only)
router.post(
    '/:id/transfer',
    requireManager,
    validate({ params: conversationIdParamSchema, body: transferConversationSchema }),
    conversationsController.transfer
);

// Mark as read
router.post(
    '/:id/read',
    validate({ params: conversationIdParamSchema }),
    conversationsController.markAsRead
);

// Get messages
router.get(
    '/:id/messages',
    validate({ params: conversationIdParamSchema, query: listMessagesQuerySchema }),
    conversationsController.getMessages
);

// Send message
router.post(
    '/:id/messages',
    validate({ params: conversationIdParamSchema, body: sendMessageSchema }),
    conversationsController.sendMessage
);

export { router as conversationsRoutes };
