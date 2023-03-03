import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequestPolicy } from '../decorators/request-policy.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { PolicyGuard } from '../guards/policy.guard';
import { UserService } from './user.service';
import { Policy } from 'src/enums/policy.enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(PolicyGuard)
  @UseGuards(JwtGuard)
  @RequestPolicy(Policy.UserGetMany)
  getMany() {
    this.userService.userRepository.getManyWithCount({ identity: null });
  }
}
