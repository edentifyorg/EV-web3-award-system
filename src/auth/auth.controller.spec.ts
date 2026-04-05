import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  signIn: jest.fn(),
  logout: jest.fn(),
  hashData: jest.fn(),
  updateRefreshToken: jest.fn(),
  getTokens: jest.fn(),
  refreshTokens: jest.fn(),
};

describe('AuthController', () => {
  let testAuthController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthController,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    testAuthController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(testAuthController).toBeDefined();
  });

  describe('signin', () => {
    it('should sign in a user and return expected result', async () => {
      const authDto = { email: 'test@test.com', password: 'testpass' };
      const expectedResponse = { message: 'Sign in successful' };

      mockAuthService.signIn.mockResolvedValue(expectedResponse);

      expect(await testAuthController.signin(authDto)).toBe(expectedResponse);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens when provided valid user ID and refresh token', async () => {
      const mockReq = {
        user: {
          sub: '123',
          refreshToken: 'some_valid_refresh_token',
        },
      };
      const expectedResponse = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      mockAuthService.refreshTokens.mockResolvedValue(expectedResponse);

      expect(await testAuthController.refreshTokens(mockReq as any)).toBe(
        expectedResponse
      );
    });

    it('should throw an error when user ID or refresh token is missing', () => {
      const mockReq = { user: {} };
      expect(() => {
        testAuthController.refreshTokens(mockReq as any);
      }).toThrowError(new Error('Missing refresh token or user ID.'));
    });
  });

  describe('logout', () => {
    it('should logout a user when provided valid user ID', () => {
      const mockReq = {
        user: {
          sub: '123',
        },
      };
      mockAuthService.logout.mockResolvedValue(123);

      expect(testAuthController.logout(mockReq as any)).toBeUndefined();
      expect(mockAuthService.logout).toHaveBeenCalledWith(
        Number(mockReq.user.sub)
      );
    });

    it('should not call logout service method if user is not provided', () => {
      const mockReq = {};

      testAuthController.logout(mockReq as any);
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
