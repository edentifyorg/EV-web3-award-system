import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionEnum } from '@prisma/client';
import { SetPermissions } from '../decorators/permissions.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const classValue = this.reflector.get<PermissionEnum>(
      SetPermissions,
      context.getClass()
    );
    const methodValue = this.reflector.get<PermissionEnum>(
      SetPermissions,
      context.getHandler()
    );

    const permissions = [
      ...(Array.isArray(classValue) ? classValue : []),
      ...(Array.isArray(methodValue) ? methodValue : []),
    ];

    if (permissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.Role.permissions) {
      return false;
    }

    for (const permission of permissions) {
      if (
        user.Role.permissions.find(
          (p: { permission: string }) => p.permission === permission
        )
      )
        return true;
    }

    return false;
  }
}
