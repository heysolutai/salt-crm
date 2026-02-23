import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:xNQNzn3WXHCMiokrwzVGQKZpEPQOR2Pi@5.78.116.66:5432/saltcrm"
        }
    }
});

async function main() {
    const msgs = await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(msgs, null, 2));
}

main().finally(() => prisma.$disconnect());
