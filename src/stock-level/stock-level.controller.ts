import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StockLevelService } from './stock-level.service';

@Controller()
export class StockLevelController {
  constructor(private readonly stockLevelService: StockLevelService) {}

  @Get('/:id')
  getById(@Param('id', new ParseIntPipe()) id: number) {
    this.stockLevelService.getById(id);
  }
}
