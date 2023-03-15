import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Identity } from 'src/auth/interfaces/identity-token-payload';
import { JwtGuard } from 'src/guards/jwt.guard';
import { RequestIdentity } from 'src/decorators/request-identity.decorator';
import { RequestPolicy } from 'src/decorators/request-policy.decorator';
import { Policy } from 'src/enums/policy.enum';
import { PolicyGuard } from 'src/guards/policy.guard';
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
