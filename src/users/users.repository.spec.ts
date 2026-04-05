import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterDto } from 'src/dto/filter.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterProcessor } from './users-filter-processor';
import { UsersRepository } from './users.repository';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    createMany: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

const mockUserFilterProcessor = {
  generateQuery: jest.fn(),
};

const userDto: CreateUserDto = {
  name: 'name',
  password: 'password',
  email: 'test@email.com',
  roleId: 1,
  refreshToken: '',
};

const usersDto: CreateUserDto[] = [
  {
    name: 'name',
    password: 'password',
    email: 'test@email.com',
    roleId: 1,
    refreshToken: '',
  },
  {
    name: 'name 1',
    password: 'password',
    email: 'test1@email.com',
    roleId: 1,
    refreshToken: '',
  },
];

describe('UsersRepository', () => {
  let testUsersRepository: UsersRepository;
  let prismaService: jest.Mocked<typeof mockPrismaService>;
  let userFilterProcessor: jest.Mocked<typeof mockUserFilterProcessor>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UserFilterProcessor,
          useValue: mockUserFilterProcessor,
        },
      ],
    }).compile();

    testUsersRepository = module.get<UsersRepository>(UsersRepository);
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as unknown as jest.Mocked<typeof mockPrismaService>;
    userFilterProcessor = module.get<UserFilterProcessor>(
      UserFilterProcessor
    ) as unknown as jest.Mocked<typeof mockUserFilterProcessor>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(testUsersRepository).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      prismaService.user.create.mockResolvedValue(userDto as CreateUserDto);

      const result = await testUsersRepository.createUser(userDto);
      expect(result).toEqual(userDto);
      expect(prismaService.user.create).toHaveBeenCalledWith({ data: userDto });
    });
  });

  describe('createUsers', () => {
    it('should create many users', async () => {
      prismaService.user.createMany.mockResolvedValue(
        usersDto as CreateUserDto[]
      );

      const result = await testUsersRepository.createManyUsers(usersDto);
      expect(result).toEqual(usersDto);
      expect(prismaService.user.createMany).toHaveBeenCalledWith({
        data: usersDto,
      });
    });
  });

  describe('getUser', () => {
    it('should get a user', async () => {
      const where = { id: 1 };
      prismaService.user.findUnique.mockResolvedValue(userDto as CreateUserDto);

      const result = await testUsersRepository.getUser({ where });
      expect(result).toEqual(userDto);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where });
    });
  });

  describe('getUsers', () => {
    it('should get users', async () => {
      prismaService.user.findMany.mockResolvedValue(
        usersDto as CreateUserDto[]
      );

      const result = await testUsersRepository.getUsers({});
      expect(result).toEqual(usersDto);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({});
    });
  });

  describe('filterUsers', () => {
    it('should get many users', async () => {
      const mockParams = 'mockParams';
      prismaService.user.findMany.mockResolvedValue(userDto as CreateUserDto);

      const result = await testUsersRepository.getUsers(
        mockParams as FilterDto
      );

      expect(result).toEqual(userDto);
      expect(prismaService.user.findMany).toHaveBeenCalledWith(mockParams);
    });

    it('should count users based on the provided filter', async () => {
      const mockFilterInput = 'mockFilterInput';
      const mockGeneratedQuery = { some: 'query' };
      const expectedCount = 10;

      userFilterProcessor.generateQuery.mockReturnValueOnce(mockGeneratedQuery);

      prismaService.user.count.mockResolvedValue(expectedCount);

      const result = await testUsersRepository.countUsers(
        mockFilterInput as FilterDto
      );

      expect(result).toEqual(expectedCount);
      expect(userFilterProcessor.generateQuery).toHaveBeenCalledWith(
        mockFilterInput
      );
      expect(prismaService.user.count).toHaveBeenCalledWith(mockGeneratedQuery);
    });

    it('should filter users based on the provided filter', async () => {
      const mockFilter = 'mockFilter' as unknown as FilterDto;
      const mockGeneratedQuery = { where: { someField: 'someValue' } };
      const mockUsers = [
        { id: 1, externalUserReference: 'ar1' },
        { id: 2, externalUserReference: 'ar2' },
      ];

      userFilterProcessor.generateQuery.mockReturnValueOnce(mockGeneratedQuery);

      prismaService.user.findMany.mockResolvedValueOnce(mockUsers);

      const result = await testUsersRepository.filterUsers(mockFilter);

      expect(result).toEqual(mockUsers);
      expect(userFilterProcessor.generateQuery).toHaveBeenCalledWith(
        mockFilter
      );
      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        mockGeneratedQuery
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto = { name: 'updatedName' };
      const where = { email: 'test@email.com' };
      prismaService.user.update.mockResolvedValue({
        ...userDto,
        ...updateUserDto,
      } as CreateUserDto);

      const result = await testUsersRepository.updateUser({
        where,
        data: updateUserDto,
      });
      expect(result).toEqual({ ...userDto, ...updateUserDto });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where,
        data: updateUserDto,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const where = { id: 1 };
      prismaService.user.delete.mockResolvedValue(userDto as CreateUserDto);

      const result = await testUsersRepository.deleteUser({ where });
      expect(result).toEqual(userDto);
      expect(prismaService.user.delete).toHaveBeenCalledWith({ where });
    });
  });

  describe('getUserWithRoleByEmail', () => {
    it('should retrieve a user with role by email', async () => {
      const email = 'test@email.com';
      const mockUserWithRole = {
        name: 'name',
        email: email,
        Role: {
          name: 'roleName',
          permissions: [{ id: 1, name: 'permissionName' }],
        },
      };

      prismaService.user.findUnique.mockResolvedValue(mockUserWithRole);

      const result = await testUsersRepository.getUserWithRoleByEmail(email);

      expect(result).toEqual(mockUserWithRole);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: {
          Role: {
            include: {
              permissions: true,
            },
          },
        },
      });
    });
  });

  describe('getUserById', () => {
    it('should retrieve an user by its id', async () => {
      const userId = 1;
      const expectedUser = { id: userId, name: 'Example' };
      prismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await testUsersRepository.getUserById(userId);

      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          Role: {
            include: {
              permissions: true,
            },
          },
        },
      });
    });

    it('should return null if the user does not exist', async () => {
      const userId = 999;
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await testUsersRepository.getUserById(userId);

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          Role: {
            include: {
              permissions: true,
            },
          },
        },
      });
    });
  });

  describe('updateUserById', () => {
    it('should update an user by its id', async () => {
      const userId = 1;
      const updateData = { name: 'Updated' };
      const updatedUser = { id: userId, ...updateData };
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await testUsersRepository.updateUserById(
        userId,
        updateData
      );

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
    });
  });

  describe('deleteUserById', () => {
    it('should delete an user by its id', async () => {
      const userId = 1;
      const deleteResponse = { count: 1 };
      prismaService.user.delete.mockResolvedValue(deleteResponse);

      const result = await testUsersRepository.deleteUserById(userId);

      expect(result).toEqual(deleteResponse);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
