import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IncomingMessage } from 'http';
import { JoinType } from '../postgres/interfaces';
import { User } from '../user/user.entity';
import { UserRelation } from '../user/user.repository';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest<IncomingMessage & { user?: User }>(context); // you could use FastifyRequest here too
    try {
      const token = this.getToken(request);
      const { organizationId, userId } = this.jwtService.verify(token);
      const user = await this.userService.userRepository.getOne({
        where: { organizationId, id: userId },
        joins: [
          { relation: UserRelation.Organization, type: JoinType.Inner },
          { relation: UserRelation.Role, type: JoinType.Left },
        ],
      });
      if (!user) {
        return false;
      }
      request.user = user;
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
