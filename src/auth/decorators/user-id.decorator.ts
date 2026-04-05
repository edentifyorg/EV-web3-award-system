import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserId = createParamDecorator((ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user?.id;
});
