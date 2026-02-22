import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, tenantId: true }
    });
    console.log('All users in DB:');
    console.log(JSON.stringify(users, null, 2));

    const tenants = await prisma.tenant.findMany({
        select: { id: true, name: true }
    });
    console.log('\nAll tenants in DB:');
    console.log(JSON.stringify(tenants, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
