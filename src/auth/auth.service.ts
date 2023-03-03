import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthenticateDto } from './dto/authenticate.dto';
import { Identity } from './interfaces/identity-token-payload';
import * as argon2 from 'argon2';
import { User } from '../user/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private createToken(user: User): string {
    const token: Identity = {
      userId: user.id,
      organizationId: user.organizationId,
      roleId: user.roleId,
      policies: user.role.policies,
    };
    return this.jwtService.sign(token);
  }

  private validateUserExists(user: User) {
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }
  }

  private async validatePassword(hash: string, plain: string) {
    const match = await argon2.verify(hash, plain);
    if (!match) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  async authenticate(
    authenticateDto: AuthenticateDto,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.userService.userRepository.getByAuth(
      authenticateDto.email,
    );

    this.validateUserExists(user);
    await this.validatePassword(user.password, authenticateDto.password);

    delete user.password;

    return { accessToken: this.createToken(user), user };
  }
}
