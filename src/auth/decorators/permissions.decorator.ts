import { Reflector } from '@nestjs/core';

export const SetPermissions = Reflector.createDecorator<string[]>();
