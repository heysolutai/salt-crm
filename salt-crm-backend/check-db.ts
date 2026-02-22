import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const c = await prisma.whatsappConnection.findMany();
    console.log(JSON.stringify(c, null, 2));
}
main().finally(() => prisma.$disconnect());
