import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'eryk@saltdigi.com.br' },
        select: { id: true, email: true, tenantId: true }
    });
    console.log('User:', user);

    const leads = await prisma.lead.findMany({
        select: { id: true, name: true, tenantId: true },
        take: 2
    });
    console.log('Leads:', leads);

    const convs = await prisma.conversation.findMany({
        select: { id: true, contactPhone: true, tenantId: true },
        take: 2
    });
    console.log('Conversations:', convs);

    const was = await prisma.whatsappConnection.findMany({
        select: { id: true, name: true, tenantId: true },
        take: 2
    });
    console.log('WA Connections:', was);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
