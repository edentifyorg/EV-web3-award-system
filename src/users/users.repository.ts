import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaServiceTransaction } from 'src/types/prisma-transaction';
import { FilterDto } from 'src/dto/filter.dto';
import { BaseRepository } from 'src/base-classes/base-repository/base-repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterProcessor } from './users-filter-processor';

@Injectable()
export class UsersRepository extends BaseRepository {
  constructor(
    prisma: PrismaService,
    private filterProcessor: UserFilterProcessor
  ) {
    super(prisma);
  }

  async createUser(
    createUserDto: CreateUserDto,
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<User> {
    return tx.user.create({ data: createUserDto });
  }

  async createManyUsers(
    createUserDto: CreateUserDto[],
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<Prisma.BatchPayload> {
    return tx.user.createMany({ data: createUserDto });
  }

  async getUser(
    params: {
      where: Prisma.UserWhereUniqueInput;
      include?: Prisma.UserInclude;
      select?: Prisma.UserSelect;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<User | null> {
    return tx.user.findUnique(params);
  }

  async getUsers(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.UserWhereUniqueInput;
      where?: Prisma.UserWhereInput;
      orderBy?: Prisma.UserOrderByWithRelationInput;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<User[]> {
    return tx.user.findMany(params);
  }

  async filterUsers(
    filter: FilterDto,
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<User[]> {
    const query = this.filterProcessor.generateQuery(filter);
    return tx.user.findMany(query);
  }

  async countUsers(
    filter: FilterDto,
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<number> {
    const query = this.filterProcessor.generateQuery(filter);
    delete query.take;
    delete query.skip;
    delete query.include;
    return tx.user.count(query);
  }

  async updateUser(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: UpdateUserDto;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<User> {
    return tx.user.update(params);
  }

  async deleteUser(
    params: {
      where: Prisma.UserWhereUniqueInput;
    },
    tx: PrismaServiceTransaction = this.prisma
  ): Promise<User> {
    return tx.user.delete(params);
  }

  async getUserWithRoleByEmail(
    email: string,
    transaction?: PrismaServiceTransaction
  ) {
    return await this.getUser(
      {
        where: { email },
        include: {
          Role: {
            include: {
              permissions: true,
            },
          },
        },
      },
      transaction
    );
  }

  async getUserById(id: number, transaction?: PrismaServiceTransaction) {
    return this.getUser(
      {
        where: { id },
        include: {
          Role: {
            include: {
              permissions: true,
            },
          },
        },
      },
      transaction
    );
  }

  async updateUserById(
    id: number,
    updateUserDto: UpdateUserDto,
    transaction?: PrismaServiceTransaction
  ) {
    return this.updateUser(
      {
        where: { id },
        data: updateUserDto,
      },
      transaction
    );
  }

  async deleteUserById(id: number, transaction?: PrismaServiceTransaction) {
    return this.deleteUser(
      {
        where: { id },
      },
      transaction
    );
  }
}
