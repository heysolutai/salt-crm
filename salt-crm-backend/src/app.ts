import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { funnelsRoutes } from './modules/funnels/funnels.routes.js';
import { leadsRoutes } from './modules/leads/leads.routes.js';
import { conversationsRoutes } from './modules/conversations/conversations.routes.js';
import { whatsappRoutes } from './modules/whatsapp/whatsapp.routes.js';
import { webhookRoutes } from './modules/webhooks/webhook.routes.js';
import { logger } from './utils/logger.js';

const app = express();

// CORS - allow frontend + webhook requests from any origin
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (webhooks, server-to-server)
        if (!origin) return callback(null, true);
        // Allow frontend
        if (origin === env.FRONTEND_URL) return callback(null, true);
        // Allow all for now (webhooks come from UAZAPI servers)
        callback(null, true);
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

// API Routes
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/funnels', funnelsRoutes);
apiRouter.use('/leads', leadsRoutes);
apiRouter.use('/conversations', conversationsRoutes);
apiRouter.use('/whatsapp', whatsappRoutes);

app.use('/api/v1', apiRouter);

// Internal webhook routes (outside /api/v1)
app.use('/webhooks', webhookRoutes);

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
