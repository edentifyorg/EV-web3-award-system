import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as argon2 from 'argon2';
import { FilterDto } from 'src/dto/filter.dto';
import { RolesHelpers } from 'src/roles/roles.helper';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersHelpers } from './users.helper';

const mockTransaction = {};

const mockUsersRepository = {
  executeTransaction: jest.fn(async cb => cb(mockTransaction)),
  createUser: jest.fn(),
  filterUsers: jest.fn(),
  countUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUserById: jest.fn(),
  deleteUserById: jest.fn(),
  getUserWithRoleByEmail: jest.fn(),
};

const mockUsersHelper = {
  userWithIdExists: jest.fn(),
  userWithEmailExists: jest.fn(),
};

const mockRolesHelper = {
  roleWithIdExists: jest.fn(),
};

const userDto: CreateUserDto = {
  name: 'name',
  password: 'password',
  email: 'test@email.com',
  roleId: 1,
  refreshToken: '',
};

describe('UsersService', () => {
  let testUsersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: UsersHelpers,
          useValue: mockUsersHelper,
        },
        {
          provide: RolesHelpers,
          useValue: mockRolesHelper,
        },
      ],
    }).compile();

    testUsersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(testUsersService).toBeDefined();
  });

  describe('create', () => {
    it('should throw error if user with given email already exists', async () => {
      mockUsersHelper.userWithEmailExists.mockResolvedValue(true);

      await expect(testUsersService.create(userDto)).rejects.toThrow(
        new HttpException(
          `User with email: ${userDto.email} already exists.`,
          HttpStatus.PRECONDITION_FAILED
        )
      );
    });

    it('should throw error if role with given id does not exist', async () => {
      mockUsersHelper.userWithEmailExists.mockResolvedValue(false);
      mockRolesHelper.roleWithIdExists.mockResolvedValue(false);

      await expect(testUsersService.create(userDto)).rejects.toThrow(
        new HttpException(
          `Role with id: ${userDto.roleId} doesn't exists.`,
          HttpStatus.PRECONDITION_FAILED
        )
      );
    });

    it('should create a user successfully', async () => {
      mockUsersHelper.userWithEmailExists.mockResolvedValue(false);
      mockRolesHelper.roleWithIdExists.mockResolvedValue(true);

      jest.spyOn(argon2, 'hash').mockResolvedValue('fakeHashedPassword');

      const createdUser = { ...userDto, id: 'someGeneratedId' };

      mockUsersRepository.createUser.mockResolvedValue(createdUser);

      const result = await testUsersService.create(userDto);

      const expectedUserDtoWithHashedPassword = {
        ...userDto,
        password: 'fakeHashedPassword',
      };

      expect(result).toEqual(createdUser);
      expect(mockUsersRepository.createUser).toHaveBeenCalledWith(
        expectedUserDtoWithHashedPassword
      );
    });
  });

  describe('filterAll', () => {
    it('should return users based on the provided filter', async () => {
      const filter: FilterDto = { skip: 1, take: 2 };
      const usersArray = [
        { id: 1, name: 'name1' },
        { id: 2, name: 'name2' },
      ];

      mockUsersRepository.filterUsers.mockResolvedValue(usersArray);
      mockUsersRepository.countUsers.mockResolvedValue(2);

      const result = await testUsersService.filterAll(filter);

      expect(result.data).toEqual(usersArray);
      expect(result.totalCount).toEqual(2);
      expect(mockUsersRepository.filterUsers).toHaveBeenCalledWith(
        filter,
        mockTransaction
      );
    });

    it('should return an empty array if no users match the provided filter', async () => {
      const filter: FilterDto = { skip: 1, take: 1 };

      mockUsersRepository.filterUsers.mockResolvedValue([]);
      mockUsersRepository.countUsers.mockResolvedValue(0);

      const result = await testUsersService.filterAll(filter);

      expect(result.data).toEqual([]);
      expect(result.totalCount).toEqual(0);
      expect(mockUsersRepository.filterUsers).toHaveBeenCalledWith(
        filter,
        mockTransaction
      );
    });

    it('should return all users if the filter is empty', async () => {
      const filter: FilterDto = {};
      const usersArray = [
        { id: 1, name: 'name1' },
        { id: 2, name: 'name2' },
      ];

      mockUsersRepository.filterUsers.mockResolvedValue(usersArray);
      mockUsersRepository.countUsers.mockResolvedValue(2);

      const result = await testUsersService.filterAll(filter);

      expect(result.data).toEqual(usersArray);
      expect(result.totalCount).toEqual(2);
      expect(mockUsersRepository.filterUsers).toHaveBeenCalledWith(
        filter,
        mockTransaction
      );
    });
  });

  describe('findOne', () => {
    it('should throw error if user with given id does not exist', async () => {
      const userId = 123;
      mockUsersHelper.userWithIdExists.mockResolvedValue(false);

      await expect(testUsersService.findOne(userId)).rejects.toThrow(
        new HttpException(
          `User with id: ${userId} doesn't exists.`,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should return the user if user with given id exists', async () => {
      const userId = 123;

      mockUsersHelper.userWithIdExists.mockResolvedValue(true);
      mockUsersRepository.getUserById.mockResolvedValue(userDto);

      const result = await testUsersService.findOne(userId);

      expect(result).toEqual(userDto);
      expect(mockUsersRepository.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOneByEmail', () => {
    it('should throw error if user with given email does not exist', async () => {
      const userEmail = 'test@test.com';
      mockUsersHelper.userWithEmailExists.mockResolvedValue(false);

      await expect(testUsersService.findOneByEmail(userEmail)).rejects.toThrow(
        new HttpException(
          `User with email: ${userEmail} doesn't exists.`,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should return the user if user with given email exists', async () => {
      const userEmail = 'test@test.com';

      mockUsersHelper.userWithEmailExists.mockResolvedValue(true);
      mockUsersRepository.getUserWithRoleByEmail.mockResolvedValue(userDto);

      const result = await testUsersService.findOneByEmail(userEmail);

      expect(result).toEqual(userDto);
      expect(mockUsersRepository.getUserWithRoleByEmail).toHaveBeenCalledWith(
        userEmail
      );
    });
  });

  describe('update', () => {
    it('should throw error if user with given id does not exist during update', async () => {
      const userId = 123;
      mockUsersHelper.userWithIdExists.mockResolvedValue(false);

      await expect(testUsersService.update(userId, {})).rejects.toThrow(
        new HttpException(
          `User with id: ${userId} doesn't exists.`,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should update the user if user with given id exists', async () => {
      const userId = 123;
      const updateDto = { email: 'updated@email.com' };

      mockUsersHelper.userWithIdExists.mockResolvedValue(true);
      mockUsersRepository.updateUserById.mockResolvedValue(userId);

      const result = await testUsersService.update(userId, updateDto);

      expect(result).toEqual(userId);
      expect(mockUsersRepository.updateUserById).toHaveBeenCalledWith(
        userId,
        updateDto
      );
    });
  });

  describe('remove', () => {
    it('should throw error if user with given id does not exist during remove', async () => {
      const userId = 123;
      mockUsersHelper.userWithIdExists.mockResolvedValue(false);

      await expect(testUsersService.remove(userId)).rejects.toThrow(
        new HttpException(
          `User with id: ${userId} doesn't exists.`,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should remove the user if user with given id exists', async () => {
      const userId = 123;

      mockUsersHelper.userWithIdExists.mockResolvedValue(true);
      mockUsersRepository.deleteUserById.mockResolvedValue(userId);

      const result = await testUsersService.remove(userId);

      expect(result).toEqual(userId);
      expect(mockUsersRepository.deleteUserById).toHaveBeenCalledWith(userId);
    });
  });
});
