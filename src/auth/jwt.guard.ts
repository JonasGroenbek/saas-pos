import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IncomingMessage } from 'http';
import { Identity } from './interfaces/identity-token-payload';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest<IncomingMessage & { identity?: Identity }>(
      context,
    ); // you could use FastifyRequest here too
    try {
      const token = this.getToken(request);
      const payload: Identity = this.jwtService.verify(token);

      request.identity = payload;
    } catch (e) {
      return false;
    }

    return true;
  }

  protected getRequest<T>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }

  protected getToken(request: {
    headers: Record<string, string | string[]>;
  }): string {
    const authorization = request.headers['authorization'];
    if (!authorization || Array.isArray(authorization)) {
      throw new Error('Invalid Authorization Header');
    }
    const [_, token] = authorization.split(' ');
    return token;
  }
}
