import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@saltdigital.com.br';
    const password = 'admin123@SALT';
    const name = 'Admin SALT';

    console.log(`Buscando se superadmin já existe...`);
    let admin = await prisma.superAdminUser.findUnique({
        where: { email }
    });

    if (admin) {
        console.log(`SuperAdmin (${email}) já existe. Pulando criação.`);
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        admin = await prisma.superAdminUser.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'master',
                isActive: true
            }
        });

        console.log(`✅ SuperAdmin criado com sucesso!`);
        console.log(`Email: ${email}`);
        console.log(`Senha: ${password}`);
    }
}

main()
    .catch((e) => {
        console.error('Erro ao criar SuperAdmin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
