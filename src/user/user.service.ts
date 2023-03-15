import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserRepository } from './user.repository';
import * as argon2 from 'argon2';
import { User } from './user.entity';
import { QueryRunner } from 'typeorm';
import { Identity } from '../auth/interfaces/identity-token-payload';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    public readonly userRepository: UserRepository,
  ) {}

  private async validateUserDoesNotExist(
    email: string,
    identity: Identity | null,
  ) {
    const conflictingUser = await this.userRepository.getOne({
      where: { email },
      identity,
    });

    if (conflictingUser) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }
  }

  private validateRegisterUserDtoMatchesIdentity(
    userDto: RegisterUserDto,
    identity: Identity | null,
  ) {
    return !identity || identity.organizationId === userDto.organizationId;
  }

  async registerUser(args: {
    userDto: RegisterUserDto;
    identity: Identity | null;
    queryRunner?: QueryRunner;
  }): Promise<User> {
    const { userDto, queryRunner, identity } = args;
    await this.validateUserDoesNotExist(userDto.email, identity);
    this.validateRegisterUserDtoMatchesIdentity(userDto, identity);

    const entity = {
      email: userDto.email,
      roleId: userDto.roleId,
      password: await argon2.hash(userDto.password),
      organizationId: identity?.organizationId || userDto.organizationId,
      firstName: userDto.firstName,
      lastName: userDto.lastName,
    };

    const user = await this.userRepository.insertOne({
      entity,
      identity,
      queryRunner,
    });

    return user;
  }
}
