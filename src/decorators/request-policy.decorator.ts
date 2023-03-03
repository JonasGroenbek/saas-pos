import { SetMetadata } from '@nestjs/common';
import { Policy } from '../enums/policy.enum';

export const RequestPolicy = (policy: Policy) => {
  return SetMetadata('request_policy', policy);
};
