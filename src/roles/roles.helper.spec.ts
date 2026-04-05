import { Test, TestingModule } from '@nestjs/testing';
import { RolesRepository } from './roles.repository';
import { RolesHelpers } from './roles.helper';

describe('RolesHelpers', () => {
  let testRolesHelpers: RolesHelpers;
  let mockRolesRepository: any;

  beforeEach(async () => {
    mockRolesRepository = {
      getRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesHelpers,
        {
          provide: RolesRepository,
          useValue: mockRolesRepository,
        },
      ],
    }).compile();

    testRolesHelpers = module.get<RolesHelpers>(RolesHelpers);
  });

  describe('roleWithIdExists', () => {
    it('should return true if role with given id exists', async () => {
      const roleId = 123;
      const mockRole = { id: roleId, name: 'testRole' };

      mockRolesRepository.getRole.mockResolvedValue(mockRole);

      const result = await testRolesHelpers.roleWithIdExists(roleId);

      expect(result).toBe(true);
    });

    it('should return false if role with given id does not exist', async () => {
      const roleId = 456;

      mockRolesRepository.getRole.mockResolvedValue(null);

      const result = await testRolesHelpers.roleWithIdExists(roleId);

      expect(result).toBe(false);
    });
  });
});
