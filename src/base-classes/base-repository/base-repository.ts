import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaServiceTransaction } from 'src/types/prisma-transaction';

@Injectable()
export class BaseRepository {
  constructor(protected readonly prisma: PrismaService) {}

  public executeTransaction<T>(
    callback: (transaction: PrismaServiceTransaction) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
