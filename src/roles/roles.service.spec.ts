import { Test, TestingModule } from '@nestjs/testing';
import { PermissionEnum } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FilterDto } from 'src/dto/filter.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';

describe('RolesService', () => {
  let testRolesService: RolesService;
  let mockRepository: any;

  const mockTransaction = {};

  beforeEach(async () => {
    mockRepository = {
      executeTransaction: jest.fn(async cb => cb(mockTransaction)),
      getRole: jest.fn(),
      getRoles: jest.fn(),
      createRole: jest.fn(),
      filterRoles: jest.fn(),
      countRoles: jest.fn(),
      getRoleById: jest.fn(),
      updateRoleById: jest.fn(),
      deleteRoleById: jest.fn(),
      getRoleByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RolesRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    testRolesService = module.get<RolesService>(RolesService);
  });

  describe('create', () => {
    it('should throw an error if role already exists', async () => {
      const roleName = 'admin';
      const permissions = [PermissionEnum.PERM_USER_READ];
      mockRepository.getRoleByName.mockResolvedValueOnce(roleName);
      const dto: CreateRoleDto = { name: roleName, permissions };

      await expect(testRolesService.create(dto)).rejects.toThrow(
        new HttpException(
          `Role with name: ${roleName} already exists.`,
          HttpStatus.PRECONDITION_FAILED
        )
      );
    });

    it('should successfully create a role', async () => {
      const permissions = [PermissionEnum.PERM_USER_READ];
      mockRepository.getRoleByName.mockResolvedValueOnce();
      const dto: CreateRoleDto = { name: 'admin', permissions };
      const createdRole = {
        id: 1,
        name: 'admin',
        permissions: permissions.map(permission => ({ permission })),
      };
      mockRepository.createRole.mockResolvedValueOnce(createdRole);

      const result = await testRolesService.create(dto);

      expect(result).toEqual(createdRole);
      expect(mockRepository.createRole).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles = [
        { id: 1, name: 'admin' },
        { id: 2, name: 'user' },
      ];
      mockRepository.getRoles.mockResolvedValueOnce(roles);

      const result = await testRolesService.findAll({});

      expect(result).toEqual(roles);
      expect(mockRepository.getRoles).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should throw an error if role not found', async () => {
      mockRepository.getRole.mockResolvedValueOnce(undefined);
      const roleId = 1;
      await expect(testRolesService.findOne(roleId)).rejects.toThrow(
        new HttpException(
          `Role with id: ${roleId} doesn't exists.`,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should return role if found', async () => {
      const roleId = 1;
      mockRepository.getRoleById.mockResolvedValueOnce(roleId);

      const result = await testRolesService.findOne(1);

      expect(result).toEqual(roleId);
      expect(mockRepository.getRoleById).toHaveBeenCalledWith(1);
    });
  });

  describe('filterAll', () => {
    it('should return roles based on the provided filter', async () => {
      const filter: FilterDto = { skip: 1, take: 2 };
      const rolesArray = [
        { id: 1, name: 'name1' },
        { id: 2, name: 'name2' },
      ];

      mockRepository.filterRoles.mockResolvedValue(rolesArray);
      mockRepository.countRoles.mockResolvedValue(2);

      const result = await testRolesService.filterAll(filter);

      expect(result.data).toEqual(rolesArray);
      expect(result.totalCount).toEqual(2);
      expect(mockRepository.filterRoles).toHaveBeenCalledWith(
        filter,
        mockTransaction
      );
    });

    it('should return an empty array if no roles match the provided filter', async () => {
      const filter: FilterDto = { skip: 1, take: 1 };

      mockRepository.filterRoles.mockResolvedValue([]);
      mockRepository.countRoles.mockResolvedValue(0);

      const result = await testRolesService.filterAll(filter);

      expect(result.data).toEqual([]);
      expect(result.totalCount).toEqual(0);
      expect(mockRepository.filterRoles).toHaveBeenCalledWith(
        filter,
        mockTransaction
      );
    });

    it('should return all roles if the filter is empty', async () => {
      const filter: FilterDto = {};
      const rolesArray = [
        { id: 1, name: 'name1' },
        { id: 2, name: 'name2' },
      ];

      mockRepository.filterRoles.mockResolvedValue(rolesArray);
      mockRepository.countRoles.mockResolvedValue(2);

      const result = await testRolesService.filterAll(filter);

      expect(result.data).toEqual(rolesArray);
      expect(result.totalCount).toEqual(2);
      expect(mockRepository.filterRoles).toHaveBeenCalledWith(
        filter,
        mockTransaction
      );
    });
  });

  describe('update', () => {
    it('should throw an error if role not found', async () => {
      mockRepository.getRoleById.mockResolvedValueOnce();
      const dto: UpdateRoleDto = {
        name: 'updatedAdmin',
        permissions: [PermissionEnum.PERM_ROLE_UPDATE],
      };
      const roleId = 1;

      await expect(testRolesService.update(roleId, dto)).rejects.toThrow(
        new HttpException(
          `Role with id: ${roleId} doesn't exists.`,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should successfully update and return the role', async () => {
      const permissions = [PermissionEnum.PERM_USER_READ];
      const roleBeforeUpdate = {
        id: 1,
        name: 'admin',
        permissions: [],
      };
      const dto: UpdateRoleDto = { name: 'updatedAdmin', permissions };
      const updatedRole = {
        ...roleBeforeUpdate,
        name: dto.name,
        permissions: permissions.map(permission => ({ permission })),
      };

      mockRepository.getRoleById.mockResolvedValueOnce(roleBeforeUpdate);
      mockRepository.updateRoleById.mockResolvedValueOnce(updatedRole);

      const result = await testRolesService.update(roleBeforeUpdate.id, dto);

      expect(result).toEqual(updatedRole);
      expect(mockRepository.updateRoleById).toHaveBeenCalledWith(
        roleBeforeUpdate.id,
        dto
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if role not found', async () => {
      mockRepository.getRoles.mockResolvedValueOnce([]);
      const roleId = 1;
      await expect(testRolesService.remove(roleId)).rejects.toThrow(
        new HttpException(
          `Role with id: ${roleId} doesn't exists.`,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should successfully remove the role', async () => {
      const role = { id: 1, name: 'admin' };
      mockRepository.getRoleById.mockResolvedValueOnce(role.id);
      mockRepository.deleteRoleById.mockResolvedValueOnce(true);

      const result = await testRolesService.remove(1);

      expect(result).toBeTruthy();
      expect(mockRepository.deleteRoleById).toHaveBeenCalledWith(role.id);
    });
  });
});
