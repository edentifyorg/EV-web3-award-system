import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { File } from '@prisma/client';
import { PrismaServiceTransaction } from 'src/types/prisma-transaction';
import { CreateFileDto } from './dto/create-file.dto';
import { FilesStorage } from './files.storage';
import { FilesRepository } from './files.repository';

@Injectable()
export class FilesService {
  constructor(
    private readonly repository: FilesRepository,
    private readonly fileStorage: FilesStorage
  ) {}

  async saveFile(file: any, tx?: PrismaServiceTransaction): Promise<File> {
    const fileMeta: CreateFileDto = {
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      private: false,
    };
    const createdFile = await this.repository.createFile(fileMeta, tx);

    await this.fileStorage.storeFile(file.buffer, createdFile.id);

    return createdFile;
  }

  async getFile(id: string): Promise<{ fileMeta: File; fileContent: Buffer }> {
    const file = await this.repository.getFileById(id);

    if (!file) {
      throw new HttpException(
        `File with id: ${id} doesn't exist.`,
        HttpStatus.NOT_FOUND
      );
    }

    const fileBuffer = await this.fileStorage.retrieveFile(id);

    return {
      fileMeta: file,
      fileContent: fileBuffer,
    };
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.repository.getFileById(id);

    if (!file) {
      throw new HttpException(
        `File with id: ${id} doesn't exist.`,
        HttpStatus.NOT_FOUND
      );
    }

    await this.fileStorage.deleteFile(file.id);
    await this.repository.deleteFileById(id);
  }
}
