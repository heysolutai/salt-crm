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

            // Validate required fields
            if (!data.instance || !data.data?.key?.remoteJid) {
                return null;
            }

            const phone = data.data.key.remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
            const isGroup = data.data.key.remoteJid.includes('@g.us');

            let content = '';
            let contentType: WebhookMessage['contentType'] = 'text';
            let mediaUrl: string | undefined;

            const message = data.data.message;
            if (message.conversation) {
                content = message.conversation;
                contentType = 'text';
            } else if (message.extendedTextMessage) {
                content = message.extendedTextMessage.text;
                contentType = 'text';
            } else if (message.imageMessage) {
                contentType = 'image';
                mediaUrl = message.imageMessage.url;
                content = message.imageMessage.caption || '';
            } else if (message.audioMessage) {
                contentType = 'audio';
                mediaUrl = message.audioMessage.url;
            } else if (message.videoMessage) {
                contentType = 'video';
                mediaUrl = message.videoMessage.url;
                content = message.videoMessage.caption || '';
            } else if (message.documentMessage) {
                contentType = 'document';
                mediaUrl = message.documentMessage.url;
                content = message.documentMessage.fileName || '';
            } else if (message.stickerMessage) {
                contentType = 'sticker';
                mediaUrl = message.stickerMessage.url;
            }

            return {
                instanceId: data.instance,
                phone,
                messageId: data.data.key.id,
                content,
                contentType,
                mediaUrl,
                timestamp: data.data.messageTimestamp * 1000,
                isGroup,
                senderName: data.data.pushName,
            };
        } catch (error) {
            logger.error('Failed to parse webhook message:', error);
            return null;
        }
    }
}

export const uazapiService = new UAZAPIService();
