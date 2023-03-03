import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { OrderlineService } from './orderline.service';

@Controller()
export class OrderlineController {
  constructor(private readonly orderlineService: OrderlineService) {}

  @Get('/:id')
  getById(@Param('id', new ParseIntPipe()) id: number) {
    this.orderlineService.getById(id);
  }
}
