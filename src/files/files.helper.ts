import { Injectable } from '@nestjs/common';
import { FilesRepository } from './files.repository';

@Injectable()
export class FilesHelper {
  constructor(private readonly repository: FilesRepository) {}

  async fileWithIdExists(id: string): Promise<boolean> {
    const fileWithId = await this.repository.getFileById(id);

    return fileWithId != null;
  }
}
