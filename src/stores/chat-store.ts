import { create } from 'zustand';
import api from '@/lib/api';
import { socketClient } from '@/lib/socket';

export interface ChatConversation {
    id: string;
    contactPhone: string;
    status: string;
    unreadCount: number;
    lastMessageAt: string | null;
    createdAt: string;
    lead?: {
        id: string;
        name: string;
        phone: string;
        avatarUrl: string | null;
        temperature: string;
    } | null;
    assignedTo?: {
        id: string;
        name: string;
        avatarUrl: string | null;
    } | null;
    whatsappConnection?: {
        id: string;
        phoneNumber: string;
        name: string;
    } | null;
    _count?: {
        messages: number;
    };
}

export interface ChatMessage {
    id: string;
    direction: 'inbound' | 'outbound';
    senderType: 'client' | 'agent' | 'system';
    content: string;
    contentType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contacts' | 'template' | 'interactive' | 'button' | 'list' | 'unknown';
    mediaUrl: string | null;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    createdAt: string;
    sender?: {
        id: string;
        name: string;
        avatarUrl: string | null;
    } | null;
}

interface ChatState {
    conversations: ChatConversation[];
    messages: Record<string, ChatMessage[]>; // keyed by conversation id
    activeConversationId: string | null;
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;

    setActiveConversation: (id: string | null) => void;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, content: string, contentType?: string, mediaUrl?: string) => Promise<void>;
    markAsRead: (conversationId: string) => Promise<void>;

    // Socket handlers
    initSocketListeners: () => void;
    handleNewMessage: (conversationId: string, message: ChatMessage) => void;
    handleMessageStatus: (conversationId: string, messageId: string, status: string) => void;
    handleNewConversation: (conversation: ChatConversation) => void;
    handleConversationUpdate: (conversation: ChatConversation) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    messages: {},
    activeConversationId: null,
    isLoadingConversations: false,
    isLoadingMessages: false,

    setActiveConversation: (id) => {
        set({ activeConversationId: id });
        if (id) {
            get().fetchMessages(id);
            get().markAsRead(id);
            socketClient.joinConversation(id);
        }
    },

    fetchConversations: async () => {
        set({ isLoadingConversations: true });
        try {
            const { data } = await api.get('/conversations?limit=50');
            set({ conversations: data.data || [] });
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            set({ isLoadingConversations: false });
        }
    },

    fetchMessages: async (conversationId) => {
        set({ isLoadingMessages: true });
        try {
            const { data } = await api.get(`/conversations/${conversationId}/messages?limit=100`);
            // Backend returns desc (newest first). Let's reverse it for the UI (oldest first)
            const reversed = [...data].reverse();
            set((state) => ({
                messages: { ...state.messages, [conversationId]: reversed }
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            set({ isLoadingMessages: false });
        }
    },

    sendMessage: async (conversationId, content, contentType = 'text', mediaUrl?: string) => {
        try {
            // Optimistic UI update could be done here
            const { data } = await api.post(`/conversations/${conversationId}/messages`, {
                content,
                contentType,
                mediaUrl
            });
            // Result comes via socket typically, or we can push it
            set((state) => {
                const existing = state.messages[conversationId] || [];
                // Only push if not already there
                if (!existing.find(m => m.id === data.id)) {
                    return { messages: { ...state.messages, [conversationId]: [...existing, data] } };
                }
                return state;
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    },

    markAsRead: async (conversationId) => {
        try {
            await api.post(`/conversations/${conversationId}/read`);
            set((state) => ({
                conversations: state.conversations.map(c =>
                    c.id === conversationId ? { ...c, unreadCount: 0 } : c
                )
            }));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    },

    initSocketListeners: () => {
        socketClient.onNewMessage((message) => {
            console.log('socket new message', message);
            // The event payload from backend: socketService.emitNewMessage(conversation.id, dbMessage);
            // Wait, backend just emits data. But how do we know which conversation it belongs to?
            // Actually `socketService.emitNewMessage(conversation.id, dbMessage)` emits to room `conversation:${conversationId}`. 
            // The client gets just the message data. It has `conversationId`.
            if (!message.conversationId) return;
            get().handleNewMessage(message.conversationId, message);
        });

        socketClient.onMessageStatus((data) => {
            get().handleMessageStatus(data.conversationId || '', data.messageId, data.status);
        });

        socketClient.onNewConversation((conversation) => {
            get().handleNewConversation(conversation);
        });

        socketClient.onConversationUpdate((conversation) => {
            get().handleConversationUpdate(conversation);
        });
    },

    handleNewMessage: (conversationId, message) => {
        set((state) => {
            const existing = state.messages[conversationId] || [];
            if (existing.find(m => m.id === message.id)) return state;

            // Re-order conversations to top
            let newConversations = [...state.conversations];
            const convIndex = newConversations.findIndex(c => c.id === conversationId);

            if (convIndex >= 0) {
                const conv = { ...newConversations[convIndex] };
                conv.lastMessageAt = message.createdAt;
                if (state.activeConversationId !== conversationId && message.direction === 'inbound') {
                    conv.unreadCount = (conv.unreadCount || 0) + 1;
                }
                newConversations.splice(convIndex, 1);
                newConversations.unshift(conv); // Move to top
            }

            return {
                messages: { ...state.messages, [conversationId]: [...existing, message] },
                conversations: newConversations
            };
        });
    },

    handleMessageStatus: (conversationId, messageId, status) => {
        set((state) => {
            const existing = state.messages[conversationId] || [];
            const index = existing.findIndex(m => m.id === messageId);
            if (index < 0) return state;

            const updated = [...existing];
            updated[index] = { ...updated[index], status: status as any };

            return {
                messages: { ...state.messages, [conversationId]: updated }
            };
        });
    },

    handleNewConversation: (conversation) => {
        set((state) => {
            const exists = state.conversations.find(c => c.id === conversation.id);
            if (exists) return state;
            return {
                conversations: [conversation, ...state.conversations]
            };
        });
    },

    handleConversationUpdate: (conversation) => {
        set((state) => {
            return {
                conversations: state.conversations.map(c => c.id === conversation.id ? { ...c, ...conversation } : c)
            };
        });
    }
}));
