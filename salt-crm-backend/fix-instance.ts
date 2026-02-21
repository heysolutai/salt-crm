import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixInstance() {
    try {
        console.log('Fixing WhatsApp Instance in Database...');

        const tenant = await prisma.tenant.findFirst({
            where: { slug: 'salt-demo' }
        });

        if (!tenant) {
            console.log('Tenant not found');
            return;
        }

        const instanceName = "salt_saltdemo_yagoteste";

        // Check if an instance already exists for this tenant
        const existingConnection = await prisma.whatsappConnection.findFirst({
            where: { tenantId: tenant.id }
        });

        if (existingConnection) {
            console.log(`Updating existing connection from ${existingConnection.instanceId} to ${instanceName}`);
            await prisma.whatsappConnection.update({
                where: { id: existingConnection.id },
                data: {
                    instanceId: instanceName,
                    name: 'WhatsApp Principal',
                    status: 'connected'
                }
            });
            console.log('Instance updated successfully!');
        } else {
            console.log(`Creating new connection: ${instanceName}`);
            await prisma.whatsappConnection.create({
                data: {
                    tenantId: tenant.id,
                    instanceId: instanceName,
                    name: 'WhatsApp Principal',
                    status: 'connected',
                    isDefault: true
                }
            });
            console.log('Instance created successfully!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixInstance();
