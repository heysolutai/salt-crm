import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

interface UAZAPIConfig {
    baseUrl: string;
    apiKey: string;
}

export interface SendMessageParams {
    instanceId: string;
    phone: string;
    message: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video' | 'document';
}

export interface SendMessageResponse {
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
            const result = await this.request<{ id: string }>('/send/text', {
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
            const result = await this.request<{ id: string }>('/send/media', {
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

    // Fetch base64 from a media message id
    async getBase64MediaFromWebhookMessage(instanceId: string, messageId: string): Promise<string | null> {
        try {
            const result = await this.request<{ base64: string }>(`/chat/getBase64FromMediaMessage/${instanceId}`, {
                method: 'POST',
                body: JSON.stringify({
                    message: {
                        key: {
                            id: messageId
                        }
                    }
                }),
            });

            if (result && result.base64) {
                return result.base64;
            }
            return null;
        } catch (error) {
            logger.error(`Failed to get base64 media for message ${messageId}:`, error);
            return null;
        }
    }

    // Send Presence Update
    async sendPresence(instanceId: string, phone: string, isTyping: boolean): Promise<boolean> {
        try {
            await this.request('/message/presence', {
                method: 'POST',
                body: JSON.stringify({
                    instance: instanceId,
                    number: phone,
                    presence: isTyping ? 'composing' : 'paused' // Typical whatsapp presence values; Uazapi will handle it
                }),
            });
            return true;
        } catch (error) {
            logger.error('Failed to send presence:', error);
            return false;
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

    // Save base64 string to local file
    saveBase64MediaLocally(base64Data: string, contentType: string): string | null {
        try {
            const fs = require('fs');
            const path = require('path');

            let ext = '.bin';
            if (contentType === 'audio') ext = '.ogg';
            else if (contentType === 'video') ext = '.mp4';
            else if (contentType === 'image') ext = '.jpg';
            else if (contentType === 'document') ext = '.pdf';

            const filename = `inbound-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            if (base64Data.includes('base64,')) {
                base64Data = base64Data.split('base64,')[1];
            }

            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(path.join(uploadDir, filename), buffer);
            return `${env.API_URL}/uploads/${filename}`;
        } catch (e) {
            logger.error('Failed to save webhook base64 media', e);
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

            // In Evolution API, message.key holds the ID, fromMe, remoteJid.
            // In UAZAPI v2, message.fromMe exists directly.
            const fromMe = message.fromMe === true || message.key?.fromMe === true;

            // Extract phone from chatid/remoteJid
            const getPhone = (id?: string) => id ? id.split('@')[0] : '';
            // It MUST prioritize chatid over sender_pn, because sender_pn is the user's OWN number if fromMe is true
            const rawPhoneId = message.key?.remoteJid || message.chatid || chat?.wa_chatid || chat?.phone || message.sender_pn;
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
            let base64Data = message.base64 || message.message?.base64;

            if (base64Data) {
                const url = this.saveBase64MediaLocally(base64Data, contentType);
                if (url) mediaUrl = url;
            } else if (message.url) {
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
                chatLid: message.sender_lid || message.chatlid || chat?.wa_chatlid,
                fromMe
            };
        } catch (error) {
            logger.error('Failed to parse webhook message:', error);
            return null;
        }
    }
}

export const uazapiService = new UAZAPIService();
