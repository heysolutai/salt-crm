import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching active admin user...');
    const admin = await prisma.user.findFirst({
        where: { email: 'eryk@saltdigi.com.br' },
        select: { id: true, email: true, tenantId: true }
    });

    if (!admin) {
        console.error('Admin not found');
        return;
    }
    const realTenantId = admin.tenantId;
    console.log(`Real tenant ID: ${realTenantId} for admin ${admin.email}`);

    // Update whatsapp connections
    const waRes = await prisma.whatsappConnection.updateMany({
        data: { tenantId: realTenantId }
    });
    console.log(`Updated ${waRes.count} Whatsapp Connections`);

    // Update leads
    const leadRes = await prisma.lead.updateMany({
        data: { tenantId: realTenantId }
    });
    console.log(`Updated ${leadRes.count} Leads`);

    // Update conversations
    const convRes = await prisma.conversation.updateMany({
        data: { tenantId: realTenantId }
    });
    console.log(`Updated ${convRes.count} Conversations`);

    // Update messages (just in case they have tenantId directly)
    // Check if messages has tenantId first
    console.log('All tenant IDs aligned!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
