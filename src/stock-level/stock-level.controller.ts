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
import { StockLevelService } from './stock-level.service';

@Controller()
export class StockLevelController {
  constructor(private readonly stockLevelService: StockLevelService) {}

  @Get('/:id')
  @UseGuards(PolicyGuard)
  @UseGuards(JwtGuard)
  @RequestPolicy(Policy.StockLevelGetById)
  async getById(
    @RequestIdentity() identity: Identity,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    return await this.stockLevelService.stockLevelRepository.getOne({
      where: { id },
      identity,
    });
  }
}
