import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('admin123', 12);

    const result = await prisma.user.updateMany({
        where: { email: 'eryk@saltdigi.com.br' },
        data: { password: hash },
    });

    console.log('Users updated:', result.count);

    // Verify
    const user = await prisma.user.findFirst({
        where: { email: 'eryk@saltdigi.com.br' },
        select: { email: true, password: true },
    });

    if (user) {
        const valid = await bcrypt.compare('admin123', user.password);
        console.log('Password verification:', valid ? '✅ OK' : '❌ FAILED');
    }
}

main()
    .finally(() => prisma.$disconnect());
