import { Identity } from './identity';

export interface JwtToken {
  sub: string;
  identity: Identity;
}
