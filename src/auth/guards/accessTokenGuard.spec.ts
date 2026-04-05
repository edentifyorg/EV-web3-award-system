import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { AccessTokenGuard } from './accessToken.guard';

describe('AccessTokenGuard', () => {
  let testAccessTokenGuard: AccessTokenGuard;
  let testReflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccessTokenGuard,
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn() },
        },
      ],
    }).compile();

    testAccessTokenGuard = moduleRef.get<AccessTokenGuard>(AccessTokenGuard);
    testReflector = moduleRef.get<Reflector>(Reflector);
  });

  it('should allow access if endpoint is public', () => {
    jest.spyOn(testReflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    expect(testAccessTokenGuard.canActivate(context)).toBe(true);
  });

  it('should fallback to JWT authentication if endpoint is not public', () => {
    jest.spyOn(testReflector, 'getAllAndOverride').mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const superCanActivateSpy = jest.spyOn(
      testAccessTokenGuard as any,
      'canActivate'
    );
    superCanActivateSpy.mockReturnValue(true);

    expect(testAccessTokenGuard.canActivate(context)).toBe(true);
    expect(superCanActivateSpy).toBeCalled();
  });
});
