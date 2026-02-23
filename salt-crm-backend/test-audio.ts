import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const msgs = await prisma.message.findMany({
        where: { contentType: 'audio' },
        orderBy: { createdAt: 'desc' },
        take: 3
    });
    console.log(JSON.stringify(msgs, null, 2));
}

main().finally(() => prisma.$disconnect());
