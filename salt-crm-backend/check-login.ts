import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findFirst({
        where: { email: 'eryk@saltdigi.com.br' },
        include: { tenant: true }
    });

    if (!user) {
        console.log('User not found!');
        return;
    }

    console.log('User status:', user.isActive);
    console.log('Tenant status:', user.tenant.status);

    const isValid = await bcrypt.compare('admin123', user.password);
    console.log('Password is valid?', isValid);
}

check().catch(console.error).finally(() => prisma.$disconnect());
