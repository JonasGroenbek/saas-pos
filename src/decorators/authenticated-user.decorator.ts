import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

export const AuthenticatedUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();
    const user = request.identity;
    return data ? user && user[data] : user;
  },
);
