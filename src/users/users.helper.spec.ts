import { UsersHelpers } from './users.helper';
import { UsersRepository } from './users.repository';

const userDto = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'name',
  password: 'password',
  email: 'test@email.com',
  roleId: 1,
  refreshToken: '',
};

describe('UsersHelpers', () => {
  let testUsersHelpers: UsersHelpers;
  let mockRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    mockRepository = {
      getUser: jest.fn(),
    } as any;

    testUsersHelpers = new UsersHelpers(mockRepository);
  });

  describe('userWithIdExists', () => {
    it('should return true if user exists by ID', async () => {
      mockRepository.getUser.mockResolvedValueOnce(userDto);
      const result = await testUsersHelpers.userWithIdExists(1);
      expect(result).toBe(true);
    });

    it('should return false if user does not exist by ID', async () => {
      mockRepository.getUser.mockResolvedValueOnce(null);
      const result = await testUsersHelpers.userWithIdExists(1);
      expect(result).toBe(false);
    });
  });

  describe('userWithEmailExists', () => {
    it('should return true if user exists by email', async () => {
      mockRepository.getUser.mockResolvedValueOnce(userDto);
      const result =
        await testUsersHelpers.userWithEmailExists('test@test.com');
      expect(result).toBe(true);
    });

    it('should return false if user does not exist by email', async () => {
      mockRepository.getUser.mockResolvedValueOnce(null);
      const result =
        await testUsersHelpers.userWithEmailExists('test@test.com');
      expect(result).toBe(false);
    });
  });
});
