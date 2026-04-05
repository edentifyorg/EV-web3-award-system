import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let mockReflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    mockReflector = {
      get: jest.fn(),
      getAll: jest.fn(),
      getAllAndMerge: jest.fn(),
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
  });

  it('should allow access if there are no permissions', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            Role: {
              permissions: [{ permission: 'ANY_PERMISSION' }],
            },
          },
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    };
    mockReflector.get.mockReturnValue(undefined);

    expect(rolesGuard.canActivate(mockContext as any)).toBe(true);
  });

  it('should deny access if user lacks required permissions', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            Role: {
              permissions: [{ permission: 'OTHER_PERMISSION' }],
            },
          },
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    };
    mockReflector.get.mockReturnValueOnce(['REQUIRED_PERMISSION']);

    expect(rolesGuard.canActivate(mockContext as any)).toBe(false);
  });

  it('should allow access if user has class-level permissions', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            Role: {
              permissions: [{ permission: 'CLASS_PERMISSION' }],
            },
          },
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    };
    mockReflector.get
      .mockReturnValueOnce(['CLASS_PERMISSION'])
      .mockReturnValueOnce(undefined);

    expect(rolesGuard.canActivate(mockContext as any)).toBe(true);
  });

  it('should allow access if user has method-level permissions', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            Role: {
              permissions: [{ permission: 'METHOD_PERMISSION' }],
            },
          },
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    };
    mockReflector.get
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(['METHOD_PERMISSION']);

    expect(rolesGuard.canActivate(mockContext as any)).toBe(true);
  });

  it('should allow access if user has either class or method permissions', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            Role: {
              permissions: [{ permission: 'CLASS_PERMISSION' }],
            },
          },
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    };
    mockReflector.get
      .mockReturnValueOnce(['CLASS_PERMISSION'])
      .mockReturnValueOnce(['METHOD_PERMISSION']);

    expect(rolesGuard.canActivate(mockContext as any)).toBe(true);
  });

  it("should deny access if user doesn't have either class or method permissions", () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            Role: {
              permissions: [{ permission: 'ANOTHER_PERMISSION' }],
            },
          },
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    };
    mockReflector.get
      .mockReturnValueOnce(['CLASS_PERMISSION'])
      .mockReturnValueOnce(['METHOD_PERMISSION']);

    expect(rolesGuard.canActivate(mockContext as any)).toBe(false);
  });

  it('should allow access if user has both class and method permissions', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            Role: {
              permissions: [
                { permission: 'CLASS_PERMISSION' },
                { permission: 'METHOD_PERMISSION' },
              ],
            },
          },
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    };
    mockReflector.get
      .mockReturnValueOnce(['CLASS_PERMISSION'])
      .mockReturnValueOnce(['METHOD_PERMISSION']);

    expect(rolesGuard.canActivate(mockContext as any)).toBe(true);
  });

  it('should deny access if user is not set in the request', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    };
    mockReflector.get.mockReturnValueOnce(['CLASS_PERMISSION']);

    expect(rolesGuard.canActivate(mockContext as any)).toBe(false);
  });

  it('should deny access if user permissions are not set', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            Role: {},
          },
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    };
    mockReflector.get.mockReturnValueOnce(['CLASS_PERMISSION']);

    expect(rolesGuard.canActivate(mockContext as any)).toBe(false);
  });
});
