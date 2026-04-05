import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { RolesHelpers } from 'src/roles/roles.helper';
import { FilterDto } from 'src/dto/filter.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UsersHelpers } from './users.helper';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private usersHelper: UsersHelpers,
    private rolesHelper: RolesHelpers
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (await this.usersHelper.userWithEmailExists(createUserDto.email)) {
      throw new HttpException(
        `User with email: ${createUserDto.email} already exists.`,
        HttpStatus.PRECONDITION_FAILED
      );
    }

    if (!(await this.rolesHelper.roleWithIdExists(createUserDto.roleId))) {
      throw new HttpException(
        `Role with id: ${createUserDto.roleId} doesn't exists.`,
        HttpStatus.PRECONDITION_FAILED
      );
    }

    const hashedPassword = await argon2.hash(createUserDto.password);

    const userWithHashedPassword = {
      ...createUserDto,
      password: hashedPassword,
    };

    return this.usersRepository.createUser(userWithHashedPassword);
  }

  async filterAll(filter: FilterDto) {
    return this.usersRepository.executeTransaction(async transaction => {
      const data = await this.usersRepository.filterUsers(filter, transaction);
      const totalCount = await this.usersRepository.countUsers(
        filter,
        transaction
      );

      return { data, totalCount };
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.getUserById(id);

    if (!user) {
      throw new HttpException(
        `User with id: ${id} doesn't exists.`,
        HttpStatus.NOT_FOUND
      );
    }

    return user;
  }

  async findOneByEmail(email: string) {
    const userWithRole =
      await this.usersRepository.getUserWithRoleByEmail(email);

    if (!userWithRole) {
      throw new HttpException(
        `User with email: ${email} doesn't exists.`,
        HttpStatus.NOT_FOUND
      );
    }

    return userWithRole;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (!(await this.usersHelper.userWithIdExists(id))) {
      throw new HttpException(
        `User with id: ${id} doesn't exists.`,
        HttpStatus.NOT_FOUND
      );
    }

    return this.usersRepository.updateUserById(id, updateUserDto);
  }

  async remove(id: number) {
    if (!(await this.usersHelper.userWithIdExists(id))) {
      throw new HttpException(
        `User with id: ${id} doesn't exists.`,
        HttpStatus.NOT_FOUND
      );
    }

    return this.usersRepository.deleteUserById(id);
  }
}
