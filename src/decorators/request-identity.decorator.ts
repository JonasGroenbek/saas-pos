import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

export const RequestIdentity = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();
    const identity = request.identity;
    if (!identity) {
      throw new HttpException('No valid identity', HttpStatus.UNAUTHORIZED);
    }
    return data ? identity && identity[data] : identity;
  },
);
