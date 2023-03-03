import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller()
export class StockLevelController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/:id')
  getById(@Param('id', new ParseIntPipe()) id: number) {
    this.transactionService.getById(id);
  }
}
