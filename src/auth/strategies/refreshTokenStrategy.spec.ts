import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenStrategy } from './refreshToken.strategy';

describe('RefreshTokenStrategy', () => {
  let testStrategy: RefreshTokenStrategy;
  let mockConfigService: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('mocked-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    testStrategy = module.get<RefreshTokenStrategy>(RefreshTokenStrategy);
  });

  it('should be defined', () => {
    expect(testStrategy).toBeDefined();
  });

  it('should use correct JWT secret', () => {
    expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
  });

  describe('validate', () => {
    it('should return payload and refreshToken when Authorization header is provided', () => {
      const mockRequest = {
        get: jest.fn().mockReturnValue('Bearer mocked-token'),
      };
      const mockPayload = { user: 'test' };

      const result = testStrategy.validate(mockRequest as any, mockPayload);

      expect(mockRequest.get).toHaveBeenCalledWith('Authorization');
      expect(result).toEqual({ ...mockPayload, refreshToken: 'mocked-token' });
    });

    it('should return payload and empty refreshToken when Authorization header is not provided', () => {
      const mockRequest = {
        get: jest.fn().mockReturnValue(undefined),
      };
      const mockPayload = { user: 'test' };

      const result = testStrategy.validate(mockRequest as any, mockPayload);

      expect(mockRequest.get).toHaveBeenCalledWith('Authorization');
      expect(result).toEqual({ ...mockPayload, refreshToken: '' });
    });
  });
});
