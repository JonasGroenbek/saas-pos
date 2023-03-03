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
    const { identity } = request;

    if (!identity) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    if (
      !identity.policies ||
      !identity.organizationId ||
      !identity.roleId ||
      !identity.userId
    ) {
      throw new HttpException('Token not valid', HttpStatus.CONFLICT);
    }

    const [groupPolicy, endpointPolicy] = requestPolicy.split('.');

    const policyMatch = identity.policies.find((userPolicy) => {
      const [userGroupPolicy, userEndpointPolicy] = userPolicy.split('.');

      return (
        (groupPolicy === userGroupPolicy || userGroupPolicy === '*') &&
        (endpointPolicy === userEndpointPolicy || userEndpointPolicy === '*')
      );
    });

    return policyMatch !== undefined;
  }
}
