import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { seedPermissions } from './seed_permissions';
import { PrismaPg } from '@prisma/adapter-pg';

import {
  createAdminRole,
  createInvoiceRole,
  createWorkerRole,
} from './seed_roles';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await argon2.hash('password');

  await seedPermissions();
  const adminRole = await createAdminRole();
  const workerRole = await createWorkerRole();
  const invoiceRole = await createInvoiceRole();

  await prisma.user.createMany({
    data: [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        roleId: adminRole.id,
        refreshToken: '',
      },
      {
        name: 'Worker User',
        email: 'worker@example.com',
        password: hashedPassword,
        roleId: workerRole.id,
        refreshToken: '',
      },
      {
        name: 'Invoice User',
        email: 'invoice@example.com',
        password: hashedPassword,
        roleId: invoiceRole.id,
        refreshToken: '',
      },
    ],
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
