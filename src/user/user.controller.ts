import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RequestPolicy } from '../decorators/request-policy.decorator';
import { JwtGuard } from '../guards/jwt.guard';
import { PolicyGuard } from '../guards/policy.guard';
import { UserService } from './user.service';
import { Policy } from '../enums/policy.enum';
import { RequestIdentity } from 'src/decorators/request-identity.decorator';
import { Identity } from 'src/auth/interfaces/identity-token-payload';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(PolicyGuard)
  @UseGuards(JwtGuard)
  @RequestPolicy(Policy.UserGetMany)
  async getMany(@RequestIdentity() identity: Identity) {
    return await this.userService.userRepository.getManyWithCount({ identity });
  }

  @Get('/:id')
  @UseGuards(PolicyGuard)
  @UseGuards(JwtGuard)
  @RequestPolicy(Policy.UserGetById)
  async getById(
    @RequestIdentity() identity: Identity,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    return await this.userService.userRepository.getOne({
      where: { id },
      identity,
    });
  }
}
