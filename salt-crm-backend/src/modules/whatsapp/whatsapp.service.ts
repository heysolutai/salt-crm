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
                browser: 'chrome'
            });

            // Extract token from either the new format or fallback format
            const instanceToken = response.data.instance?.token || response.data.hash?.token || '';

            // Try explicit webhook registration as fallback
            if (instanceToken) {
                await this.registerWebhook(instanceToken);
            }

            return response.data;
        } catch (error: any) {
            logger.error(`Error creating instance ${instanceName}:`, error.response?.data || error.message);
            throw new AppError('Failed to create WhatsApp instance', 500);
        }
    }

    private async registerWebhook(instanceToken: string) {
        try {
            const webhookUrl = process.env.WEBHOOK_URL || 'https://api.saltdigi.heysolu.com.br/webhooks/uazapi/webhook';

            await this.getClient(instanceToken).post(`/webhook`, {
                enabled: true,
                url: webhookUrl,
                events: [
                    "messages",
                    "connection_update",
                    "send_message"
                ],
                excludeMessages: [],
                addUrlEvents: false,
                addUrlTypesMessages: false
            });
            logger.info(`Webhook successfully registered for instance with token ${instanceToken.substring(0, 10)}...`);
        } catch (error: any) {
            logger.error(`Error explicitly registering webhook:`, error.response?.data || error.message);
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
     * Completely delete and wipe instance from provider
     * @param instanceToken The instance token 
     * @param instanceName The instance name
     */
    async deleteProviderInstance(instanceToken: string, instanceName: string) {
        try {
            // First attempt: DELETE /instance/:instanceName
            await this.getClient(instanceToken).delete(`/instance/${instanceName}`, {
                headers: {
                    'apikey': this.apiKey // Some evolution APIS require apikey for deletion
                }
            });
            logger.info(`Successfully deleted instance ${instanceName} via Evolution route.`);
            return true;
        } catch (error: any) {
            // Fallback: DELETE /instance/logout/:instanceName
            try {
                await this.getClient(instanceToken).delete(`/instance/logout/${instanceName}`, {
                    headers: { 'apikey': this.apiKey }
                });
                logger.info(`Successfully deleted instance ${instanceName} via fallback logout route.`);
                return true;
            } catch (fallbackError: any) {
                logger.error(`Error deleting instance ${instanceName} across all routes:`, fallbackError.response?.data || fallbackError.message);
                return false;
            }
        }
    }
}

export const whatsappService = new WhatsappService();
