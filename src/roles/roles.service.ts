import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FilterDto } from 'src/dto/filter.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.rolesRepository.getRoleByName(createRoleDto.name);

    if (role) {
      throw new HttpException(
        `Role with name: ${createRoleDto.name} already exists.`,
        HttpStatus.PRECONDITION_FAILED
      );
    }

    return this.rolesRepository.createRole(createRoleDto);
  }

  findAll(filter: FilterDto) {
    return this.rolesRepository.getRoles(filter);
  }

  async findOne(id: number) {
    const roleWithPermissions = await this.rolesRepository.getRoleById(id);

    if (!roleWithPermissions) {
      throw new HttpException(
        `Role with id: ${id} doesn't exists.`,
        HttpStatus.NOT_FOUND
      );
    }

    return roleWithPermissions;
  }

  async filterAll(filter: FilterDto) {
    return this.rolesRepository.executeTransaction(async transaction => {
      const data = await this.rolesRepository.filterRoles(filter, transaction);
      const totalCount = await this.rolesRepository.countRoles(
        filter,
        transaction
      );

      return { data, totalCount };
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.rolesRepository.getRoleById(id);

    if (!role) {
      throw new HttpException(
        `Role with id: ${id} doesn't exists.`,
        HttpStatus.NOT_FOUND
      );
    }

    return this.rolesRepository.updateRoleById(id, updateRoleDto);
  }

  async remove(id: number) {
    const role = await this.rolesRepository.getRoleById(id);

    if (!role) {
      throw new HttpException(
        `Role with id: ${id} doesn't exists.`,
        HttpStatus.NOT_FOUND
      );
    }

    return this.rolesRepository.deleteRoleById(id);
  }
}
