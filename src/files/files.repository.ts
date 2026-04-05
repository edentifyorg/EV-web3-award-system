import { Injectable } from '@nestjs/common';
import { File, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaServiceTransaction } from 'src/types/prisma-transaction';
import { BaseRepository } from 'src/base-classes/base-repository/base-repository';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async createFile(
    createFileDto: CreateFileDto,
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<File> {
    return tx.file.create({ data: createFileDto });
  }

  async createManyFiles(
    createFileDto: CreateFileDto[],
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<Prisma.BatchPayload> {
    return tx.file.createMany({ data: createFileDto });
  }

  async getFile(
    params: {
      where: Prisma.FileWhereUniqueInput;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<File | null> {
    return tx.file.findUnique(params);
  }

  async getFiles(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.FileWhereUniqueInput;
      where?: Prisma.FileWhereInput;
      orderBy?: Prisma.FileOrderByWithRelationInput;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<File[]> {
    return tx.file.findMany(params);
  }

  async updateFile(
    params: {
      where: Prisma.FileWhereUniqueInput;
      data: UpdateFileDto;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<File> {
    return tx.file.update(params);
  }

  async deleteFile(
    params: {
      where: Prisma.FileWhereUniqueInput;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<File> {
    return tx.file.delete(params);
  }

  async getFileById(id: string, transaction?: PrismaServiceTransaction) {
    return this.getFile(
      {
        where: { id },
      },
      transaction
    );
  }

  async updateFileById(
    id: string,
    updateFileDto: UpdateFileDto,
    transaction?: PrismaServiceTransaction
  ) {
    return this.updateFile(
      {
        where: { id },
        data: updateFileDto,
      },
      transaction
    );
  }

  async deleteFileById(id: string, transaction?: PrismaServiceTransaction) {
    return this.deleteFile(
      {
        where: { id },
      },
      transaction
    );
  }
}
