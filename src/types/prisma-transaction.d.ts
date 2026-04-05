import { PrismaService } from 'src/prisma/prisma.service';

export type PrismaServiceTransaction = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;
