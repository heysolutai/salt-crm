import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing all Whatsapp Connections...');

    // First clear all messages referencing the connection maybe?
    // Wait, conversations reference WhatsappConnection with ON DELETE SET NULL, so no cascade errors there.

    const count = await prisma.whatsappConnection.deleteMany({});
    console.log(`Deleted ${count.count} WhatsApp connections.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
