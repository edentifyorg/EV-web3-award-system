import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { EnvironmentVariableKey } from 'src/enum/EnvironmentVariableKey';

@Injectable()
export class FilesStorage {
  private storagePath: string;

  constructor(private readonly configService: ConfigService) {
    this.storagePath = this.configService.getOrThrow<string>(
      EnvironmentVariableKey.FILE_STORAGE
    );
  }

  async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.promises.access(this.storagePath, fs.constants.F_OK);
    } catch {
      await fs.promises.mkdir(this.storagePath, { recursive: true });
    }
  }

  async storeFile(buffer: Buffer, fileName: string): Promise<void> {
    await this.ensureDirectoryExists();
    const filePath = path.join(this.storagePath, fileName);
    await fs.promises.writeFile(filePath, buffer);
  }

  async retrieveFile(fileName: string): Promise<Buffer> {
    const filePath = path.join(this.storagePath, fileName);
    return await fs.promises.readFile(filePath);
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.storagePath, fileName);
    try {
      await fs.promises.unlink(filePath);
    } catch {
      throw new HttpException(
        `Could not delete file from filesystem: ${fileName}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
