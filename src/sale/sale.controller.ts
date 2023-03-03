import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SaleService } from './sale.service';

@Controller()
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Get('/:id')
  getById(@Param('id', new ParseIntPipe()) id: number) {
    this.saleService.getById(id);
  }
}
