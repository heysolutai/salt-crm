import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

interface UAZAPIConfig {
    baseUrl: string;
    apiKey: string;
}

interface SendMessageParams {
    instanceId: string;
    phone: string;
    message: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video' | 'document';
}

interface SendMessageResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

interface WebhookMessage {
    instanceId: string;
    phone: string;
    messageId: string;
    content: string;
    contentType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact' | 'sticker';
    mediaUrl?: string;
    timestamp: number;
    isGroup: boolean;
    senderName?: string;
    chatLid?: string;
    fromMe?: boolean;
}

export class UAZAPIService {
    private config: UAZAPIConfig;

    constructor() {
        this.config = {
            baseUrl: env.UAZAPI_BASE_URL || 'https://api.uazapi.com',
            apiKey: env.UAZAPI_API_KEY || '',
        };
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.config.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            logger.error(`UAZAPI request failed: ${response.status} - ${error}`);
            throw new Error(`UAZAPI error: ${response.status}`);
        }

        return response.json() as Promise<T>;
    }

    // Send text message
    async sendTextMessage(params: SendMessageParams): Promise<SendMessageResponse> {
        try {
            const result = await this.request<{ id: string }>('/message/text', {
                method: 'POST',
                body: JSON.stringify({
                    instance: params.instanceId,
                    number: params.phone,
                    text: params.message,
                }),
            });

            logger.info(`Message sent to ${params.phone} via instance ${params.instanceId}`);

            return {
                success: true,
                messageId: result.id,
            };
        } catch (error) {
            logger.error('Failed to send message:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    // Send media message
    async sendMediaMessage(params: SendMessageParams): Promise<SendMessageResponse> {
        if (!params.mediaUrl || !params.mediaType) {
            return { success: false, error: 'Media URL and type are required' };
        }

        try {
            const endpoint = `/message/${params.mediaType}`;
            const result = await this.request<{ id: string }>(endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    instance: params.instanceId,
                    number: params.phone,
                    url: params.mediaUrl,
                    caption: params.message,
                }),
            });

            logger.info(`Media message sent to ${params.phone}`);

            return {
                success: true,
                messageId: result.id,
            };
        } catch (error) {
            logger.error('Failed to send media message:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    // Get instance status
    async getInstanceStatus(instanceId: string): Promise<{ connected: boolean; qrCode?: string }> {
        try {
            const result = await this.request<{ status: string; qrcode?: string }>(`/instance/${instanceId}/status`);

            return {
                connected: result.status === 'connected',
                qrCode: result.qrcode,
            };
        } catch (error) {
            logger.error('Failed to get instance status:', error);
            return { connected: false };
        }
    }

    // Create new instance
    async createInstance(name: string): Promise<{ instanceId: string } | null> {
        try {
            const result = await this.request<{ instance: string }>('/instance/create', {
                method: 'POST',
                body: JSON.stringify({ name }),
            });

            return { instanceId: result.instance };
        } catch (error) {
            logger.error('Failed to create instance:', error);
            return null;
        }
    }

    // Parse incoming webhook message
    parseWebhookMessage(payload: unknown): WebhookMessage | null {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = payload as any;

            // Check if it's a message event (Evolution API uses messages.upsert/messages.update, others use EventType)
            const isMessageEvent =
                data.EventType === 'messages' ||
                data.event === 'messages' ||
                data.event === 'messages.upsert';

            if (!isMessageEvent) {
                return null;
            }

            const instanceId = data.instanceName || data.instance;

            // Evolution API wraps the message in data.message, older UAZAPI uses data.message directly
            const message = data.data?.message || data.message;
            const chat = data.chat;

            if (!instanceId || !message) {
                return null;
            }

            // In Evolution API, message.key holds the ID, fromMe, remoteJid
            const fromMe = message.fromMe === true || message.key?.fromMe === true;

            // Extract phone from chatid/remoteJid
            const getPhone = (id?: string) => id ? id.split('@')[0] : '';
            const rawPhoneId = message.key?.remoteJid || message.sender_pn || message.chatid || chat?.wa_chatid || chat?.phone;
            const phone = getPhone(rawPhoneId);

            if (!phone || phone === 'status') {
                return null; // Ignore status broadcasts
            }

            const isGroup = message.isGroup || chat?.wa_isGroup || phone.includes('g.us') || (rawPhoneId && rawPhoneId.endsWith('@g.us'));

            // Evolution usually puts text in message.message.conversation or message.message.extendedTextMessage.text
            const msgObj = message.message || message;
            let content = msgObj.conversation || msgObj.extendedTextMessage?.text || msgObj.text || msgObj.caption || message.text || message.conversation || message.caption || '';
            let contentType: WebhookMessage['contentType'] = 'text';
            let mediaUrl: string | undefined;

            // Map UAZAPI/Evolution types to ours
            const typeStr = message.messageType || message.type || Object.keys(msgObj)[0];
            if (typeStr?.includes('image')) contentType = 'image';
            else if (typeStr?.includes('video')) contentType = 'video';
            else if (typeStr?.includes('audio')) contentType = 'audio';
            else if (typeStr?.includes('document')) contentType = 'document';
            else if (typeStr?.includes('sticker')) contentType = 'sticker';
            else if (typeStr?.includes('location')) contentType = 'location';
            else if (typeStr?.includes('contact')) contentType = 'contact';

            // Extract media URL if present - UAZAPI might put it in message.url or we might need to fetch it
            if (message.url) {
                mediaUrl = message.url;
            } else if (message.mediaUrl) {
                mediaUrl = message.mediaUrl;
            }

            return {
                instanceId,
                phone,
                messageId: message.key?.id || message.messageid || message.id,
                content: content || (typeof content === 'object' ? JSON.stringify(content) : ''),
                contentType,
                mediaUrl,
                timestamp: message.messageTimestamp || Date.now(),
                isGroup,
                senderName: message.pushName || message.senderName || chat?.wa_name || chat?.wa_contactName,
                chatLid: message.sender_lid || message.chatlid || chat?.wa_chatlid
            };
        } catch (error) {
            logger.error('Failed to parse webhook message:', error);
            return null;
        }
    }
}

export const uazapiService = new UAZAPIService();
