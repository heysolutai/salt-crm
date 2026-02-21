import axios from 'axios';
import { AppError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

class WhatsappService {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com';
        this.apiKey = process.env.UAZAPI_API_KEY || '';
    }

    private getClient(instanceToken?: string) {
        return axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // UAZAPI uses admintoken for creation/management, and maybe instance token for other things
                'admintoken': this.apiKey,
                ...(instanceToken ? { 'token': instanceToken } : {})
            }
        });
    }

    /**
     * Creates a new WhatsApp instance
     * @param instanceName Name/ID for the new instance
     * @returns The created instance data including the token/key
     */
    async createInstance(instanceName: string) {
        try {
            // UAZAPI: POST /instance/init
            // Note: UAZAPI allows passing webhook URL directly during initialization
            const response = await this.getClient().post('/instance/init', {
                name: instanceName,
                systemName: 'salt-crm',
                fingerprintProfile: 'chrome',
                browser: 'chrome',
                webhook: process.env.WEBHOOK_URL || '',
                webhook_events: [
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE",
                    "MESSAGES_DELETE",
                    "SEND_MESSAGE",
                    "CONNECTION_UPDATE",
                    "CALL"
                ]
            });

            // Try explicit webhook registration as fallback
            await this.registerWebhook(instanceName);

            return response.data;
        } catch (error: any) {
            logger.error(`Error creating instance ${instanceName}:`, error.response?.data || error.message);
            throw new AppError('Failed to create WhatsApp instance', 500);
        }
    }

    private async registerWebhook(instanceName: string) {
        try {
            const webhookUrl = process.env.WEBHOOK_URL || 'https://api.saltdigi.heysolu.com.br/webhooks/uazapi/webhook';

            await this.getClient().post(`/webhook/set/${instanceName}`, {
                url: webhookUrl,
                webhook_by_events: false,
                webhook_base64: false,
                events: [
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE",
                    "SEND_MESSAGE",
                    "CONNECTION_UPDATE",
                    "CALL"
                ]
            });
            logger.info(`Webhook successfully registered for instance ${instanceName}`);
        } catch (error: any) {
            logger.error(`Error explicitly registering webhook for ${instanceName}:`, error.response?.data || error.message);
        }
    }

    /**
     * Gets the connection status and QR Code
     * @param instanceId The name of the instance created
     * @param instanceToken The token of the instance created
     * @param phone (Optional) Phone number if paired via code
     */
    async connectInstance(instanceId: string, instanceToken: string, phone?: string) {
        try {
            // UAZAPI connection endpoint requires instance name, not just token
            // Depending on the API, it might be /instance/connect or /instance/status?id=xxx
            const url = `/instance/connect`;

            const payload = phone ? { phone } : {};
            const response = await this.getClient(instanceToken).post(url, payload);

            return response.data;
        } catch (error: any) {
            logger.error(`Error connecting instance:`, error.response?.data || error.message);
            throw new AppError('Failed to get QR Code', 500);
        }
    }

    /**
     * Sends a text message
     * @param instanceToken The instance token
     * @param to Phone number
     * @param text Message body
     */
    async sendMessage(instanceToken: string, to: string, text: string) {
        try {
            const response = await this.getClient(instanceToken).post(`/send/text`, {
                number: to,
                text: text
            });
            return response.data;
        } catch (error: any) {
            logger.error(`Error sending message:`, error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Logout/Disconnect instance
     * @param instanceToken The instance token 
     */
    async logout(instanceToken: string) {
        try {
            await this.getClient(instanceToken).delete(`/instance/logout`);
            return true;
        } catch (error: any) {
            logger.error(`Error logging out:`, error.response?.data || error.message);
            return false;
        }
    }
}

export const whatsappService = new WhatsappService();
