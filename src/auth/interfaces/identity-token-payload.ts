import { Policy } from '../../enums/policy.enum';

export interface Identity {
  roleId: number;
  userId: number;
  organizationId: number;
  policies: Policy[];
}
