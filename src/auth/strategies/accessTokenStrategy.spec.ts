import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from 'src/users/users.repository';
import { AccessTokenStrategy } from './accessToken.strategy';

describe('AccessTokenStrategy', () => {
  let testStrategy: AccessTokenStrategy;
  let mockUsersRepository: Partial<UsersRepository>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockUsersRepository = {
      getUserById: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('some-secret-key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenStrategy,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    testStrategy = module.get<AccessTokenStrategy>(AccessTokenStrategy);
  });

  it('should be defined', () => {
    expect(testStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when payload is valid and user exists', async () => {
      const payload = { sub: '1', email: 'test@example.com' };
      const user = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'name',
        password: 'password',
        email: 'test@email.com',
        roleId: 1,
        refreshToken: '',
      };

      jest.spyOn(mockUsersRepository, 'getUserById').mockResolvedValue(user);

      expect(await testStrategy.validate(payload)).toEqual(user);
    });

    it('should throw an exception when user does not exist', async () => {
      const payload = { sub: '999', email: 'notfound@example.com' };

      jest.spyOn(mockUsersRepository, 'getUserById').mockResolvedValue(null);

      expect(await testStrategy.validate(payload)).toEqual(null);
    });
  });
});
