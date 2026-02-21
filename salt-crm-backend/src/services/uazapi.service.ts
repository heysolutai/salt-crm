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

            // Only process "messages" event for new messages
            if (data.EventType !== 'messages') {
                return null;
            }

            const instanceId = data.instanceName;
            const message = data.message;
            const chat = data.chat;

            if (!instanceId || !message) {
                return null;
            }

            // We usually don't want to process messages sent by ourselves in this webhook
            // unless we want to sync outbound messages sent from another device
            if (message.fromMe) {
                return null;
            }

            // Extract phone from chatid (e.g. 551199999999@s.whatsapp.net -> 551199999999)
            const getPhone = (id?: string) => id ? id.split('@')[0] : '';
            const phone = getPhone(message.sender_pn || message.chatid || chat?.wa_chatid || chat?.phone);

            if (!phone) {
                return null;
            }

            const isGroup = message.isGroup || chat?.wa_isGroup || phone.includes('g.us');

            let content = message.text || message.conversation || message.caption || '';
            let contentType: WebhookMessage['contentType'] = 'text';
            let mediaUrl: string | undefined;

            // Map UAZAPI types to ours
            if (message.type === 'image') contentType = 'image';
            else if (message.type === 'video') contentType = 'video';
            else if (message.type === 'audio') contentType = 'audio';
            else if (message.type === 'document') contentType = 'document';
            else if (message.type === 'sticker') contentType = 'sticker';
            else if (message.type === 'location') contentType = 'location';
            else if (message.type === 'contact') contentType = 'contact';

            // Extract media URL if present - UAZAPI might put it in message.url or we might need to fetch it
            if (message.url) {
                mediaUrl = message.url;
            } else if (message.mediaUrl) {
                mediaUrl = message.mediaUrl;
            }

            return {
                instanceId,
                phone,
                messageId: message.messageid || message.id,
                content: content || (typeof message.content === 'object' ? JSON.stringify(message.content) : ''),
                contentType,
                mediaUrl,
                timestamp: message.messageTimestamp || Date.now(),
                isGroup,
                senderName: message.senderName || chat?.wa_name || chat?.wa_contactName,
                chatLid: message.sender_lid || message.chatlid || chat?.wa_chatlid
            };
        } catch (error) {
            logger.error('Failed to parse webhook message:', error);
            return null;
        }
    }
}

export const uazapiService = new UAZAPIService();
