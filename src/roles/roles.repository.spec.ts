import { Test, TestingModule } from '@nestjs/testing';
import { PermissionEnum, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterDto } from 'src/dto/filter.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleFilterProcessor } from './roles-filter-processor';
import { RolesRepository } from './roles.repository';

const mockPrismaService = {
  role: {
    create: jest.fn(),
    createMany: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

const mockRoleFilterProcessor = {
  generateQuery: jest.fn(),
};

const mockRoles: Role[] = [
  {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Test 1',
  },
  {
    id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Test 2',
  },
];

const mockPermissions = [PermissionEnum.PERM_USER_READ];

const mockCreateRoleDto: CreateRoleDto = {
  name: 'Test',
  permissions: mockPermissions,
};

const mockCreateRoleDtos: CreateRoleDto[] = [
  { name: 'Test1', permissions: mockPermissions },
  { name: 'Test2', permissions: mockPermissions },
];

const mockRole = {
  id: 1,
  name: 'Test',
  permissions: mockPermissions.map(permission => ({ permission })),
};

describe('RolesRepository', () => {
  let testRolesRepository: RolesRepository;
  let prismaService: jest.Mocked<typeof mockPrismaService>;
  let roleFilterProcessor: jest.Mocked<typeof mockRoleFilterProcessor>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RoleFilterProcessor,
          useValue: mockRoleFilterProcessor,
        },
      ],
    }).compile();

    testRolesRepository = module.get<RolesRepository>(RolesRepository);
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as unknown as jest.Mocked<typeof mockPrismaService>;
    roleFilterProcessor = module.get<RoleFilterProcessor>(
      RoleFilterProcessor
    ) as unknown as jest.Mocked<typeof mockRoleFilterProcessor>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(testRolesRepository).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a new role with permissions and return it', async () => {
      prismaService.role.create.mockResolvedValue(mockRole);

      const result = await testRolesRepository.createRole(mockCreateRoleDto);

      expect(result).toEqual(mockRole);
      expect(prismaService.role.create).toHaveBeenCalledWith({
        data: {
          name: mockCreateRoleDto.name,
          permissions: {
            connect: mockPermissions.map(permission => ({
              permission: permission,
            })),
          },
        },
      });
    });
  });

  describe('createManyRoles', () => {
    it('should create many new roles and return them', async () => {
      prismaService.role.createMany.mockResolvedValue(mockRoles);

      const result =
        await testRolesRepository.createManyRoles(mockCreateRoleDtos);

      expect(result).toEqual(mockRoles);
      expect(prismaService.role.createMany).toHaveBeenCalledWith({
        data: mockCreateRoleDtos,
      });
    });
  });

  describe('getRole', () => {
    it('should get a role', async () => {
      const where = { id: 1 };
      prismaService.role.findUnique.mockResolvedValue(
        mockCreateRoleDto as CreateRoleDto
      );

      const result = await testRolesRepository.getRole({ where });
      expect(result).toEqual(mockCreateRoleDto);
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({ where });
    });
  });

  describe('getRoles', () => {
    it('should retrieve roles based on given params', async () => {
      const params = {};
      prismaService.role.findMany.mockResolvedValue(mockRoles);

      const result = await testRolesRepository.getRoles(params);

      expect(result).toEqual(mockRoles);
      expect(prismaService.role.findMany).toHaveBeenCalledWith(params);
    });
  });

  it('should get many roles', async () => {
    const mockParams = 'mockParams';

    prismaService.role.findMany.mockResolvedValue(mockRole);

    const result = await testRolesRepository.getRoles(mockParams as FilterDto);

    expect(result).toEqual(mockRole);
    expect(prismaService.role.findMany).toHaveBeenCalledWith(mockParams);
  });

  it('should count roles based on the provided filter', async () => {
    const mockFilterInput = 'mockFilterInput';
    const mockGeneratedQuery = { some: 'query' };
    const expectedCount = 10;

    roleFilterProcessor.generateQuery.mockReturnValueOnce(mockGeneratedQuery);

    prismaService.role.count.mockResolvedValue(expectedCount);

    const result = await testRolesRepository.countRoles(
      mockFilterInput as FilterDto
    );

    expect(result).toEqual(expectedCount);
    expect(roleFilterProcessor.generateQuery).toHaveBeenCalledWith(
      mockFilterInput
    );
    expect(prismaService.role.count).toHaveBeenCalledWith(mockGeneratedQuery);
  });

  it('should filter roles based on the provided filter', async () => {
    const mockFilter = 'mockFilter' as unknown as FilterDto;
    const mockGeneratedQuery = { where: { someField: 'someValue' } };
    const mockRoles = [
      { id: 1, name: 'name1' },
      { id: 2, name: 'name1' },
    ];

    roleFilterProcessor.generateQuery.mockReturnValueOnce(mockGeneratedQuery);

    prismaService.role.findMany.mockResolvedValueOnce(mockRoles);

    const result = await testRolesRepository.filterRoles(mockFilter);

    expect(result).toEqual(mockRoles);
    expect(roleFilterProcessor.generateQuery).toHaveBeenCalledWith(mockFilter);
    expect(prismaService.role.findMany).toHaveBeenCalledWith(
      mockGeneratedQuery
    );
  });

  describe('updateRole', () => {
    it('should update an existing role with permissions and return it', async () => {
      const mockUpdateRoleDto: UpdateRoleDto = {
        name: 'NewName',
        permissions: mockPermissions,
      };

      const params = {
        where: { id: mockRole.id },
        data: mockUpdateRoleDto,
      };
      prismaService.role.update.mockResolvedValue({
        ...mockRole,
        ...params.data,
      });

      const result = await testRolesRepository.updateRole(params);

      expect(result).toEqual({
        ...mockRole,
        ...params.data,
      });
      expect(prismaService.role.update).toHaveBeenCalledWith({
        where: params.where,
        data: {
          name: params.data.name,
          permissions: {
            set: [],
            connect: mockPermissions.map(permission => ({
              permission: permission,
            })),
          },
        },
      });
    });
  });

  describe('deleteRole', () => {
    it('should delete an existing role and return it', async () => {
      const params = { where: { id: mockRole.id } };
      prismaService.role.delete.mockResolvedValue(mockRole);

      const result = await testRolesRepository.deleteRole(params);

      expect(result).toEqual(mockRole);
      expect(prismaService.role.delete).toHaveBeenCalledWith(params);
    });
  });

  describe('getRoleById', () => {
    it('should retrieve an role by its id', async () => {
      const roleId = 1;
      const expectedRole = { id: roleId, name: 'Example' };
      prismaService.role.findUnique.mockResolvedValue(expectedRole);

      const result = await testRolesRepository.getRoleById(roleId);

      expect(result).toEqual(expectedRole);
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({
        where: { id: roleId },
        include: {
          permissions: {
            select: {
              permission: true,
            },
          },
        },
      });
    });

    it('should return null if the role does not exist', async () => {
      const roleId = 999;
      prismaService.role.findUnique.mockResolvedValue(null);

      const result = await testRolesRepository.getRoleById(roleId);

      expect(result).toBeNull();
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({
        where: { id: roleId },
        include: {
          permissions: {
            select: {
              permission: true,
            },
          },
        },
      });
    });
  });

  describe('updateRoleById', () => {
    it('should update an role by its id', async () => {
      const roleId = 1;
      const updateData = { name: 'Updated' };
      const updatedRole = { id: roleId, ...updateData };
      prismaService.role.update.mockResolvedValue(updatedRole);

      const result = await testRolesRepository.updateRoleById(
        roleId,
        updateData
      );

      expect(result).toEqual(updatedRole);
      expect(prismaService.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: updateData,
      });
    });
  });

  describe('deleteRoleById', () => {
    it('should delete an role by its id', async () => {
      const roleId = 1;
      const deleteResponse = { count: 1 };
      prismaService.role.delete.mockResolvedValue(deleteResponse);

      const result = await testRolesRepository.deleteRoleById(roleId);

      expect(result).toEqual(deleteResponse);
      expect(prismaService.role.delete).toHaveBeenCalledWith({
        where: { id: roleId },
      });
    });
  });

  describe('getRoleByName', () => {
    it('should retrieve a role with role by email', async () => {
      const name = 'admin';
      const mockRoleWithRole = {
        name: name,
        permissions: [{ id: 1, name: 'permissionName' }],
      };

      prismaService.role.findUnique.mockResolvedValue(mockRoleWithRole);

      const result = await testRolesRepository.getRoleByName(name);

      expect(result).toEqual(mockRoleWithRole);
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({
        where: { name },
        include: {
          permissions: {
            select: {
              permission: true,
            },
          },
        },
      });
    });
  });
});
