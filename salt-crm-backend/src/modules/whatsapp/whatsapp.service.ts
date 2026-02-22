import axios from 'axios';
import { AppError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

/**
 * UAZAPI WhatsApp Service
 * 
 * Authentication:
 * - Regular endpoints: header 'token' with the instance token
 * - Admin endpoints: header 'admintoken'
 * 
 * Key endpoints (from references/endpoints.md):
 * - POST /instance/init      → Create instance (admintoken)
 * - POST /instance/connect    → Connect / get QR code (token)
 * - POST /instance/disconnect → Disconnect (token)
 * - GET  /instance/status     → Check status (token)
 * - DELETE /instance          → Delete instance (token)
 * - POST /send/text           → Send text message (token)
 * - POST /webhook             → Configure webhook (token)
 * - GET  /webhook             → View webhook config (token)
 */
class WhatsappService {
    private baseUrl: string;
    private adminToken: string;

    constructor() {
        this.baseUrl = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com';
        this.adminToken = process.env.UAZAPI_API_KEY || '';
    }

    /**
     * Creates a new WhatsApp instance
     * Uses admintoken header
     * POST /instance/init
     */
    async createInstance(instanceName: string) {
        try {
            const response = await axios.post(`${this.baseUrl}/instance/init`, {
                name: instanceName,
                systemName: 'salt-crm',
                fingerprintProfile: 'chrome',
                browser: 'chrome'
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'admintoken': this.adminToken
                }
            });

            const instanceToken = response.data.instance?.token || response.data.hash?.token || '';

            // Register webhook right after creation using the new instance token
            if (instanceToken) {
                await this.registerWebhook(instanceToken);
            }

            return response.data;
        } catch (error: any) {
            logger.error(`Error creating instance ${instanceName}:`, error.response?.data || error.message);
            throw new AppError('Failed to create WhatsApp instance', 500);
        }
    }

    /**
     * Configure webhook for the instance
     * POST /webhook (token header)
     */
    private async registerWebhook(instanceToken: string) {
        try {
            const webhookUrl = process.env.WEBHOOK_URL || 'https://api.saltdigi.heysolu.com.br/webhooks/uazapi/webhook';

            await axios.post(`${this.baseUrl}/webhook`, {
                enabled: true,
                url: webhookUrl,
                events: [
                    "messages",
                    "messages_update",
                    "connection"
                ],
                excludeMessages: [
                    "isGroupYes"
                ],
                addUrlEvents: false,
                addUrlTypesMessages: false
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': instanceToken
                }
            });
            logger.info(`Webhook successfully registered for instance with token ${instanceToken.substring(0, 10)}...`);
        } catch (error: any) {
            logger.error(`Error registering webhook:`, error.response?.data || error.message);
        }
    }

    /**
     * Connect instance / get QR Code
     * POST /instance/connect (token header)
     */
    async connectInstance(_instanceId: string, instanceToken: string, phone?: string) {
        try {
            const payload = phone ? { phone } : {};
            const response = await axios.post(`${this.baseUrl}/instance/connect`, payload, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': instanceToken
                }
            });
            return response.data;
        } catch (error: any) {
            logger.error(`Error connecting instance:`, error.response?.data || error.message);
            throw new AppError('Failed to get QR Code', 500);
        }
    }

    /**
     * Check instance status
     * GET /instance/status (token header)
     */
    async getInstanceStatus(instanceToken: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/instance/status`, {
                headers: {
                    'Accept': 'application/json',
                    'token': instanceToken
                }
            });
            return response.data;
        } catch (error: any) {
            logger.error(`Error getting instance status:`, error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Send a text message
     * POST /send/text (token header)
     */
    async sendMessage(instanceToken: string, to: string, text: string) {
        try {
            const response = await axios.post(`${this.baseUrl}/send/text`, {
                number: to,
                text: text
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': instanceToken
                }
            });
            return response.data;
        } catch (error: any) {
            logger.error(`Error sending message:`, error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Delete instance from UAZAPI
     * DELETE /instance (token header)
     */
    async deleteProviderInstance(instanceToken: string, instanceName: string) {
        try {
            await axios.delete(`${this.baseUrl}/instance`, {
                headers: {
                    'Accept': 'application/json',
                    'token': instanceToken
                }
            });
            logger.info(`Successfully deleted instance ${instanceName} from UAZAPI.`);
            return true;
        } catch (error: any) {
            logger.error(`Error deleting instance ${instanceName}:`, error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Disconnect instance (without deleting)
     * POST /instance/disconnect (token header)
     */
    async disconnectInstance(instanceToken: string) {
        try {
            await axios.post(`${this.baseUrl}/instance/disconnect`, {}, {
                headers: {
                    'Accept': 'application/json',
                    'token': instanceToken
                }
            });
            return true;
        } catch (error: any) {
            logger.error(`Error disconnecting instance:`, error.response?.data || error.message);
            return false;
        }
    }

    /**
     * List all instances (admin)
     * GET /instance/all (admintoken header)
     */
    async listAllInstances() {
        try {
            const response = await axios.get(`${this.baseUrl}/instance/all`, {
                headers: {
                    'Accept': 'application/json',
                    'admintoken': this.adminToken
                }
            });
            return response.data;
        } catch (error: any) {
            logger.error(`Error listing instances:`, error.response?.data || error.message);
            return [];
        }
    }
}

export const whatsappService = new WhatsappService();
