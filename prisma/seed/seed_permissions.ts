import { PermissionEnum, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function seedPermissions() {
  return await prisma.permission.createMany({
    data: [
      { permission: PermissionEnum.PERM_ALL },
      { permission: PermissionEnum.PERM_USER_ALL },
      { permission: PermissionEnum.PERM_USER_CREATE },
      { permission: PermissionEnum.PERM_USER_READ },
      { permission: PermissionEnum.PERM_USER_UPDATE },
      { permission: PermissionEnum.PERM_USER_DELETE },
      { permission: PermissionEnum.PERM_ROLE_ALL },
      { permission: PermissionEnum.PERM_ROLE_CREATE },
      { permission: PermissionEnum.PERM_ROLE_READ },
      { permission: PermissionEnum.PERM_ROLE_UPDATE },
      { permission: PermissionEnum.PERM_ROLE_DELETE },
    ],
  });
}
