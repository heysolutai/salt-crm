import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env.js';
import { verifyToken } from '../config/jwt.js';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

interface AuthenticatedSocket extends Socket {
    userId: string;
    tenantId: string;
    role: string;
}

export class SocketService {
    private io: Server;
    private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

    constructor(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: env.FRONTEND_URL,
                credentials: true,
            },
        });

        this.setupAuthentication();
        this.setupEventHandlers();

        logger.info('Socket.io initialized');
    }

    private setupAuthentication() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

                if (!token) {
                    return next(new Error('Authentication required'));
                }

                const decoded = verifyToken(token);
                if (!decoded) {
                    return next(new Error('Invalid token'));
                }

                // Verify user exists and is active
                const user = await prisma.user.findUnique({
                    where: { id: decoded.sub },
                    select: { id: true, tenantId: true, role: true, isActive: true },
                });

                if (!user || !user.isActive) {
                    return next(new Error('User not found or inactive'));
                }

                // Attach user info to socket
                (socket as AuthenticatedSocket).userId = user.id;
                (socket as AuthenticatedSocket).tenantId = user.tenantId;
                (socket as AuthenticatedSocket).role = user.role;

                next();
            } catch (error) {
                logger.error('Socket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket) => {
            const authSocket = socket as AuthenticatedSocket;
            const { userId, tenantId } = authSocket;

            logger.info(`User ${userId} connected via socket ${socket.id}`);

            // Track connected user
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            this.connectedUsers.get(userId)!.add(socket.id);

            // Join tenant room for broadcasts
            socket.join(`tenant:${tenantId}`);

            // Join user-specific room
            socket.join(`user:${userId}`);

            // Handle disconnection
            socket.on('disconnect', () => {
                logger.info(`User ${userId} disconnected from socket ${socket.id}`);
                const userSockets = this.connectedUsers.get(userId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    if (userSockets.size === 0) {
                        this.connectedUsers.delete(userId);
                    }
                }
            });

            // Handle joining conversation room
            socket.on('join:conversation', (conversationId: string) => {
                socket.join(`conversation:${conversationId}`);
                logger.debug(`User ${userId} joined conversation ${conversationId}`);
            });

            // Handle leaving conversation room
            socket.on('leave:conversation', (conversationId: string) => {
                socket.leave(`conversation:${conversationId}`);
                logger.debug(`User ${userId} left conversation ${conversationId}`);
            });

            // Handle typing indicator
            socket.on('typing:start', (conversationId: string) => {
                socket.to(`conversation:${conversationId}`).emit('typing:started', {
                    userId,
                    conversationId,
                });
            });

            socket.on('typing:stop', (conversationId: string) => {
                socket.to(`conversation:${conversationId}`).emit('typing:stopped', {
                    userId,
                    conversationId,
                });
            });
        });
    }

    // ============== PUBLIC METHODS FOR EMITTING EVENTS ==============

    // Emit to specific user (all their connected sockets)
    emitToUser(userId: string, event: string, data: unknown) {
        this.io.to(`user:${userId}`).emit(event, data);
    }

    // Emit to entire tenant
    emitToTenant(tenantId: string, event: string, data: unknown) {
        this.io.to(`tenant:${tenantId}`).emit(event, data);
    }

    // Emit to conversation room
    emitToConversation(conversationId: string, event: string, data: unknown) {
        this.io.to(`conversation:${conversationId}`).emit(event, data);
    }

    // Check if user is online
    isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
    }

    // Get online users count for tenant
    getOnlineUsersCount(tenantId: string): number {
        return this.io.sockets.adapter.rooms.get(`tenant:${tenantId}`)?.size || 0;
    }

    // ============== SPECIFIC EVENT EMITTERS ==============

    // New message received/sent
    emitNewMessage(conversationId: string, message: unknown) {
        this.emitToConversation(conversationId, 'message:new', message);
    }

    // Message status updated
    emitMessageStatus(conversationId: string, messageId: string, status: string) {
        this.emitToConversation(conversationId, 'message:status', { messageId, status });
    }

    // New conversation created
    emitNewConversation(tenantId: string, conversation: unknown) {
        this.emitToTenant(tenantId, 'conversation:new', conversation);
    }

    // Conversation updated (assigned, status changed, etc)
    emitConversationUpdate(tenantId: string, conversation: unknown) {
        this.emitToTenant(tenantId, 'conversation:updated', conversation);
    }

    // Lead assigned/transferred
    emitLeadAssigned(userId: string, lead: unknown) {
        this.emitToUser(userId, 'lead:assigned', lead);
    }

    // New notification
    emitNotification(userId: string, notification: unknown) {
        this.emitToUser(userId, 'notification:new', notification);
    }
}

// Singleton instance - will be set in server.ts
export let socketService: SocketService;

export function initializeSocket(server: HttpServer): SocketService {
    socketService = new SocketService(server);
    return socketService;
}
