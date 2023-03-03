import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserRepository } from './user.repository';
import * as argon2 from 'argon2';
import { User } from './user.entity';
import { QueryRunner } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    public readonly userRepository: UserRepository,
  ) {}

  private async validateUserDoesNotExist(email: string) {
    const conflictingUser = await this.userRepository.getOne({
      where: { email, organizationId: null },
    });

    if (conflictingUser) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }
  }

  async registerUser(
    userDto: RegisterUserDto,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    await this.validateUserDoesNotExist(userDto.email);

    const user = await this.userRepository.insertOne({
      entity: {
        email: userDto.email,
        roleId: userDto.roleId,
        password: await argon2.hash(userDto.password),
        organizationId: userDto.organizationId,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
      },
      queryRunner,
    });

    return user;
  }
}
