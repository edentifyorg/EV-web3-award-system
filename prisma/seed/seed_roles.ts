import { PermissionEnum, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function createAdminRole() {
  return await prisma.role.create({
    data: {
      name: 'admin',
      permissions: {
        connect: [{ permission: PermissionEnum.PERM_ALL }],
      },
    },
  });
}

export async function createWorkerRole() {
  return await prisma.role.create({
    data: {
      name: 'worker',
      permissions: {
        connect: [
          { permission: PermissionEnum.PERM_USER_READ },
          { permission: PermissionEnum.PERM_ROLE_READ },
        ],
      },
    },
  });
}
export async function createInvoiceRole() {
  return await prisma.role.create({
    data: {
      name: 'invoice',
      permissions: {
        connect: [
          { permission: PermissionEnum.PERM_USER_CREATE },
          { permission: PermissionEnum.PERM_USER_READ },
          { permission: PermissionEnum.PERM_USER_UPDATE },
          { permission: PermissionEnum.PERM_ROLE_READ },
        ],
      },
    },
  });
}
