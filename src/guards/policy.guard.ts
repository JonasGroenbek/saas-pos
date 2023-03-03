import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Policy } from '../enums/policy.enum';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import 'dotenv/config';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requestPolicy = this.reflector.get<Policy>(
      'request_policy',
      context.getHandler(),
    );

    if (!requestPolicy) {
      return true;
    }

    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }
    if (!user.role) {
      throw new HttpException(
        'The authenticated user does not have any role',
        HttpStatus.CONFLICT,
      );
    }

    const [groupPolicy, endpointPolicy] = requestPolicy.split('.');

    const policyMatch = user.role.policies.find((userPolicy) => {
      const [userGroupPolicy, userEndpointPolicy] = userPolicy.split('.');
      (groupPolicy === userGroupPolicy || userGroupPolicy === '*') &&
        (endpointPolicy === userEndpointPolicy || userEndpointPolicy === '*');
    });

    return policyMatch !== undefined;
  }
}
