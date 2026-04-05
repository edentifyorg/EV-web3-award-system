import { Role, User } from '@prisma/client';

export type UserAndRole = Omit<User, 'Role'> & { Role: Role };
