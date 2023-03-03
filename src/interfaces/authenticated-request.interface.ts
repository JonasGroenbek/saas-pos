import { Identity } from '../auth/interfaces/identity-token-payload';

export interface AuthenticatedRequest extends Request {
  identity: Identity;
}
