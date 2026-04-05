import { Injectable } from '@nestjs/common';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesHelpers {
  constructor(private repository: RolesRepository) {}

  async roleWithIdExists(id: number): Promise<boolean> {
    const role_with_id = await this.repository.getRole({
      where: { id },
    });

    return role_with_id != null;
  }
}
