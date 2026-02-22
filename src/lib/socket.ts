import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
// Remove the /api/v1 from the base URL for the socket connection
const SOCKET_URL = API_URL.replace(/\/api\/v1$/, '') || 'http://localhost:3000';

class SocketClient {
    private socket: Socket | null = null;

    connect(token: string) {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: {
                token
            },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinConversation(conversationId: string) {
        this.socket?.emit('join:conversation', conversationId);
    }

    leaveConversation(conversationId: string) {
        this.socket?.emit('leave:conversation', conversationId);
    }

    onNewMessage(callback: (message: any) => void) {
        this.socket?.on('message:new', callback);
    }

    offNewMessage(callback: (message: any) => void) {
        this.socket?.off('message:new', callback);
    }

    onMessageStatus(callback: (data: { conversationId: string, messageId: string, status: string }) => void) {
        this.socket?.on('message:status', callback);
    }

    offMessageStatus(callback: (data: { conversationId: string, messageId: string, status: string }) => void) {
        this.socket?.off('message:status', callback);
    }

    onNewConversation(callback: (conversation: any) => void) {
        this.socket?.on('conversation:new', callback);
    }

    offNewConversation(callback: (conversation: any) => void) {
        this.socket?.off('conversation:new', callback);
    }

    onConversationUpdate(callback: (conversation: any) => void) {
        this.socket?.on('conversation:updated', callback);
    }

    offConversationUpdate(callback: (conversation: any) => void) {
        this.socket?.off('conversation:updated', callback);
    }

    onWhatsappStatus(callback: (data: { connectionId: string, instanceName: string, status: string }) => void) {
        this.socket?.on('whatsapp:status', callback);
    }

    offWhatsappStatus(callback: (data: { connectionId: string, instanceName: string, status: string }) => void) {
        this.socket?.off('whatsapp:status', callback);
    }
}

export const socketClient = new SocketClient();
