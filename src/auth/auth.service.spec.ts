import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

jest.mock('argon2');

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneByEmail: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};
const mockJWTService = {
  sign: jest.fn(),
  signAsync: jest.fn(),
  verify: jest.fn(),
  verifyAsync: jest.fn(),
  decode: jest.fn(),
};
const mockConfigService = {
  get: jest.fn(),
  getOrThrow: jest.fn(),
};

describe('AuthService', () => {
  let testAuthService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJWTService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    testAuthService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(testAuthService).toBeDefined();
  });

  describe('signIn', () => {
    it('should throw an error if the user is not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(undefined);
      await expect(
        testAuthService.signIn({
          email: 'test@example.com',
          password: 'pass123',
        })
      ).rejects.toThrow(
        new HttpException(
          `User with email: test@example.com doesn't exists.`,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should throw an error if the password is invalid', async () => {
      const user = {
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);
      expect(
        testAuthService.signIn({
          email: 'test@example.com',
          password: 'wrongPass',
        })
      ).rejects.toThrow(
        new HttpException(
          `The password is incorrect.`,
          HttpStatus.PRECONDITION_FAILED
        )
      );
    });

    it('should return tokens if the email and password are valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      mockJWTService.signAsync.mockResolvedValue('token');
      const result = await testAuthService.signIn({
        email: 'test@example.com',
        password: 'pass123',
      });

      // TODO - also fix the test with the change on signIn user return
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('user');
    });
  });

  describe('logout', () => {
    it('should call the update method of usersService', async () => {
      await testAuthService.logout(1);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, {
        refreshToken: '',
      });
    });
  });

  describe('refreshTokens', () => {
    it('should throw an error if there is no user', async () => {
      mockUsersService.findOne.mockResolvedValue(undefined);
      await expect(
        testAuthService.refreshTokens(1, 'sampleToken')
      ).rejects.toThrow(
        new HttpException(
          `There is no existing refresh token.`,
          HttpStatus.PRECONDITION_FAILED
        )
      );
    });

    it('should throw an error if refreshToken is invalid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        refreshToken: 'hashedToken',
      };
      mockUsersService.findOne.mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);
      await expect(
        testAuthService.refreshTokens(1, 'wrongToken')
      ).rejects.toThrow(
        new HttpException(
          `Refresh token missmatch.`,
          HttpStatus.PRECONDITION_FAILED
        )
      );
    });

    it('should return new tokens if refreshToken is valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        refreshToken: 'hashedToken',
      };
      mockUsersService.findOne.mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      mockJWTService.signAsync.mockResolvedValue('newToken');
      const result = await testAuthService.refreshTokens(1, 'validToken');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('hashData', () => {
    it('should call argon2.hash and return the hashed data', async () => {
      const mockData = 'testData';
      const mockHashedData = 'hashedTestData';
      jest.spyOn(argon2, 'hash').mockResolvedValue(mockHashedData);

      const result = await testAuthService.hashData(mockData);

      expect(argon2.hash).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockHashedData);
    });
  });

  describe('updateRefreshToken', () => {
    it('should call hashData and usersService.update with the correct parameters', async () => {
      const mockUserId = 1;
      const mockRefreshToken = 'testRefreshToken';
      const mockHashedToken = 'hashedRefreshToken';

      jest
        .spyOn(testAuthService, 'hashData')
        .mockResolvedValue(mockHashedToken);

      await testAuthService.updateRefreshToken(mockUserId, mockRefreshToken);

      expect(testAuthService.hashData).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockUsersService.update).toHaveBeenCalledWith(mockUserId, {
        refreshToken: mockHashedToken,
      });
    });
  });
  describe('getTokens', () => {
    it('should generate and return an accessToken and refreshToken', async () => {
      const mockUserId = 1;
      const mockEmail = 'test@example.com';
      const mockAccessToken = 'mockAccessToken';
      const mockRefreshToken = 'mockRefreshToken';

      mockJWTService.signAsync
        .mockImplementationOnce(() => Promise.resolve(mockAccessToken))
        .mockImplementationOnce(() => Promise.resolve(mockRefreshToken));
      mockConfigService.get
        .mockImplementationOnce(() => 'JWT_ACCESS_SECRET')
        .mockImplementationOnce(() => 'JWT_REFRESH_SECRET');

      const result = await testAuthService.getTokens(mockUserId, mockEmail);

      expect(mockJWTService.signAsync).toHaveBeenCalledWith(
        { sub: mockUserId, email: mockEmail },
        expect.objectContaining({
          secret: 'JWT_ACCESS_SECRET',
          expiresIn: '24h',
        })
      );

      expect(mockJWTService.signAsync).toHaveBeenCalledWith(
        { sub: mockUserId, email: mockEmail },
        expect.objectContaining({
          secret: 'JWT_REFRESH_SECRET',
          expiresIn: '7d',
        })
      );

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });
  });
});
