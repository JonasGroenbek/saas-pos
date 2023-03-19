import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Identity } from '../auth/interfaces/identity-token-payload';
import { JwtGuard } from '../guards/jwt.guard';
import { RequestIdentity } from '../decorators/request-identity.decorator';
import { RequestPolicy } from '../decorators/request-policy.decorator';
import { Policy } from '../enums/policy.enum';
import { PolicyGuard } from '../guards/policy.guard';
import { OrderlineService } from './orderline.service';

@Controller()
export class OrderlineController {
  constructor(private readonly orderlineService: OrderlineService) {}

  @Get('/:id')
  @UseGuards(PolicyGuard)
  @UseGuards(JwtGuard)
  @RequestPolicy(Policy.OrderlineGetById)
  async getById(
    @RequestIdentity() identity: Identity,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    return await this.orderlineService.orderlineRepository.getOne({
      where: { id },
      identity,
    });
  }
}
