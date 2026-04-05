import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaServiceTransaction } from 'src/types/prisma-transaction';
import { FilterDto } from 'src/dto/filter.dto';
import { BaseRepository } from 'src/base-classes/base-repository/base-repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleFilterProcessor } from './roles-filter-processor';

@Injectable()
export class RolesRepository extends BaseRepository {
  constructor(
    prisma: PrismaService,
    private filterProcessor: RoleFilterProcessor
  ) {
    super(prisma);
  }

  async createRole(
    createRoleDto: CreateRoleDto,
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<Role> {
    return tx.role.create({
      data: {
        name: createRoleDto.name,
        permissions: {
          connect: createRoleDto.permissions.map(permission => ({
            permission: permission,
          })),
        },
      },
    });
  }

  async createManyRoles(
    createRoleDto: CreateRoleDto[],
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<Prisma.BatchPayload> {
    return tx.role.createMany({ data: createRoleDto });
  }

  async getRole(
    params: {
      where: Prisma.RoleWhereUniqueInput;
      include?: Prisma.RoleInclude;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<Role | null> {
    return tx.role.findUnique(params);
  }

  async getRoles(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.RoleWhereUniqueInput;
      where?: Prisma.RoleWhereInput;
      orderBy?: Prisma.RoleOrderByWithRelationInput;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<Role[]> {
    return tx.role.findMany(params);
  }

  async filterRoles(
    filter: FilterDto,
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<Role[]> {
    const query = this.filterProcessor.generateQuery(filter);
    return tx.role.findMany(query);
  }

  async countRoles(
    filter: FilterDto,
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<number> {
    const query = this.filterProcessor.generateQuery(filter);
    delete query.take;
    delete query.skip;
    delete query.include;
    return tx.role.count(query);
  }

  async updateRole(
    params: {
      where: Prisma.RoleWhereUniqueInput;
      data: UpdateRoleDto;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<Role> {
    const updateData: Prisma.RoleUpdateInput = {};

    if (params.data.name) {
      updateData.name = params.data.name;
    }
    if (params.data.permissions) {
      updateData.permissions = {
        set: [],
        connect: params.data.permissions.map(permission => ({
          permission: permission,
        })),
      };
    }

    return tx.role.update({
      where: params.where,
      data: updateData,
    });
  }

  async deleteRole(
    params: {
      where: Prisma.RoleWhereUniqueInput;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<Role> {
    return tx.role.delete(params);
  }

  async getRoleById(id: number, transaction?: PrismaServiceTransaction) {
    return this.getRole(
      {
        where: { id },
        include: {
          permissions: {
            select: {
              permission: true,
            },
          },
        },
      },
      transaction
    );
  }

  async updateRoleById(
    id: number,
    updateRoleDto: UpdateRoleDto,
    transaction?: PrismaServiceTransaction
  ) {
    return this.updateRole(
      {
        where: { id },
        data: updateRoleDto,
      },
      transaction
    );
  }

  async deleteRoleById(id: number, transaction?: PrismaServiceTransaction) {
    return this.deleteRole(
      {
        where: { id },
      },
      transaction
    );
  }

  async getRoleByName(name: string, transaction?: PrismaServiceTransaction) {
    return await this.getRole(
      {
        where: { name },
        include: {
          permissions: {
            select: {
              permission: true,
            },
          },
        },
      },
      transaction
    );
  }
}
