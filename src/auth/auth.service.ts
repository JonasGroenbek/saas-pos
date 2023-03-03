import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthenticateDto } from './dto/authenticate.dto';
import { JwtToken } from './interfaces/jwt';
import * as argon2 from 'argon2';
import { User } from '../user/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private createToken(user: User): string {
    const token: JwtToken = {
      sub: user.email,
      identity: {
        userId: user.id,
        organizationId: user.organizationId,
        roleId: user.roleId,
      },
    };
    return this.jwtService.sign(token);
  }

  private validateUserExists(user: User) {
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }
  }

  async authenticate(
    authenticateDto: AuthenticateDto,
  ): Promise<{ accessToken: string }> {
    const user = await this.userService.userRepository.getByAuth(
      authenticateDto.email,
      await argon2.hash(authenticateDto.password),
    );

    this.validateUserExists(user);

    return { accessToken: this.createToken(user) };
  }
}
