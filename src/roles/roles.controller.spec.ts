import { Test, TestingModule } from '@nestjs/testing';
import { PermissionEnum } from '@prisma/client';
import { FilterDto } from 'src/dto/filter.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let testRolesController: RolesController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      filterAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockService,
        },
      ],
    }).compile();

    testRolesController = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(testRolesController).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a role', async () => {
      const mockPermissions = [PermissionEnum.PERM_USER_READ];
      const mockRole: CreateRoleDto = {
        name: 'Test',
        permissions: mockPermissions,
      };
      mockService.create.mockResolvedValue(mockRole);

      expect(await testRolesController.create(mockRole)).toEqual(mockRole);
      expect(mockService.create).toHaveBeenCalledWith(mockRole);
    });
  });

  describe('findAll', () => {
    it('should return all roles based on filter', async () => {
      const mockFilter = {};
      const mockRoles = [{ name: 'admin' }, { name: 'user' }];
      mockService.findAll.mockResolvedValue(mockRoles);

      expect(await testRolesController.findAll(mockFilter)).toEqual(mockRoles);
      expect(mockService.findAll).toHaveBeenCalledWith(mockFilter);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const id = '1';
      const mockRole = { id: 1, name: 'admin' };
      mockService.findOne.mockResolvedValue(mockRole);

      expect(await testRolesController.findOne(id)).toEqual(mockRole);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('filterAll', () => {
    it('should properly execute the function and return a proper value', async () => {
      const mockFilter: FilterDto = {};
      const mockReturnValue = 'mockReturnValue';
      mockService.filterAll.mockReturnValue(mockReturnValue);

      const result = await testRolesController.filterAll(mockFilter);

      expect(result).toBe(mockReturnValue);
      expect(mockService.filterAll).toHaveBeenCalledWith(mockFilter);
    });
  });

  describe('update', () => {
    it('should update and return the updated role', async () => {
      const id = '1';
      const updateDto = { name: 'superadmin' };
      const updatedRole = { id: 1, name: 'superadmin' };

      mockService.update.mockResolvedValue(updatedRole);

      expect(await testRolesController.update(id, updateDto)).toEqual(
        updatedRole
      );
      expect(mockService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a role by id', async () => {
      const id = '1';
      const mockRole = { id: 1, name: 'admin' };

      mockService.remove.mockResolvedValue(mockRole);

      expect(await testRolesController.remove(id)).toEqual(mockRole);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });
});
