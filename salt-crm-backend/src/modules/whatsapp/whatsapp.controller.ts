import { Request, Response, NextFunction } from 'express';
import { whatsappService } from './whatsapp.service.js';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/errors.js';

export class WhatsappController {

    // Create a new instance for a tenant
    async createInstance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, phone } = req.body; // Phone is optional
            const tenantId = req.user!.tenantId;

            const tenant = await prisma.tenant.findUnique({
                where: { id: tenantId }
            });

            if (!tenant) {
                throw new AppError('Tenant not found', 404);
            }

            // Sanitize tenant name (remove special chars, spaces, lowercase)
            // UAZAPI is strict: name can be anything but we'll keep it clean
            const sanitizedTenantName = tenant.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const sanitizedInstanceName = name.toLowerCase().replace(/[^a-z0-9]/g, '');

            // Construct final instance name without the random suffix as requested by user
            // Format: salt-{empresa}-{nome}
            const finalInstanceName = `salt-${sanitizedTenantName}-${sanitizedInstanceName}`;

            // Call service
            const result = await whatsappService.createInstance(finalInstanceName);

            // UAZAPI specific response structure parsing
            const token = result.instance?.token || result.token;

            if (!token) {
                throw new AppError('Invalid response from WhatsApp Provider (Missing token)', 502);
            }

            // Extract initial QR code if available
            const qrCode = result.instance?.qrcode || result.qrcode || null;
            const status = result.instance?.status === 'connected' ? 'connected' : 'pending';

            // Check if connection already exists to avoid unique constraint error
            let connection = await prisma.whatsappConnection.findFirst({
                where: {
                    tenantId,
                    name: name
                }
            });

            if (connection) {
                connection = await prisma.whatsappConnection.update({
                    where: { id: connection.id },
                    data: {
                        instanceId: finalInstanceName,
                        // @ts-ignore
                        instanceToken: token,
                        qrCode: qrCode,
                        status: status as any
                    }
                });
            } else {
                connection = await prisma.whatsappConnection.create({
                    data: {
                        tenantId,
                        instanceId: finalInstanceName,
                        // @ts-ignore
                        instanceToken: token,
                        name: name, // Original display name
                        phoneNumber: phone || '', // Save phone or empty string
                        status: status as any,
                        type: 'business',
                        qrCode: qrCode
                    }
                });
            }

            res.status(201).json(connection);
        } catch (error) {
            next(error);
        }
    }

    // Get QR Code / Connect
    async connect(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params; // DB ID of the connection

            const connection = await prisma.whatsappConnection.findFirst({
                where: {
                    id,
                    tenantId: req.user!.tenantId
                }
            });

            if (!connection) {
                throw new AppError('Connection not found', 404);
            }

            if (connection.status === 'connected') {
                res.status(200).json({ status: 'connected', message: 'Already connected' });
                return;
            }

            try {
                // Call UAZAPI to generate a new QR Code
                const result = await whatsappService.connectInstance(
                    connection.instanceId,
                    // @ts-ignore
                    connection.instanceToken || '',
                    connection.phoneNumber
                );

                let fetchedQr = null;

                // UAZAPI specific response structure logic:
                // Expected format: { instance: { qrcode: "data:..." } }
                if (result.instance?.qrcode) {
                    fetchedQr = result.instance.qrcode;
                    result.qrcode = fetchedQr; // normalize for frontend
                } else if (result.qrcode || result.base64) {
                    fetchedQr = result.qrcode || result.base64;
                }

                if (fetchedQr) {
                    await prisma.whatsappConnection.update({
                        where: { id },
                        data: { qrCode: fetchedQr }
                    });
                }

                res.status(200).json(result);
            } catch (err: any) {
                // If it fails (e.g., instance not found in provider), return existing code if any over 404
                if (connection.qrCode) {
                    res.status(200).json({
                        qrcode: connection.qrCode,
                        base64: connection.qrCode,
                        status: connection.status
                    });
                } else {
                    throw err; // throw the actual AppError 500 from service
                }
            }
        } catch (error) {
            next(error);
        }
    }

    // Webhook handler
    async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Handle incoming events
            // TODO: Implement webhook processing
            console.log('Webhook received:', req.body);
            res.status(200).send('OK');
        } catch (error) {
            next(error);
        }
    }

    // List all instances for the tenant
    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;

            const connections = await prisma.whatsappConnection.findMany({
                where: { tenantId },
                orderBy: { createdAt: 'desc' }
            });

            res.status(200).json(connections);
        } catch (error) {
            next(error);
        }
    }

    // Delete instance
    async deleteInstance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const tenantId = req.user!.tenantId;

            const connection = await prisma.whatsappConnection.findFirst({
                where: { id, tenantId }
            });

            if (!connection) {
                throw new AppError('Connection not found', 404);
            }

            // Completely destroy UAZAPI instance to free up internal provider limits
            // @ts-ignore
            if (connection.instanceToken) {
                // @ts-ignore
                await whatsappService.deleteProviderInstance(connection.instanceToken, connection.instanceId);
            }

            await prisma.whatsappConnection.delete({
                where: { id }
            });

            res.status(200).json({ success: true, message: 'Instance deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export const whatsappController = new WhatsappController();
