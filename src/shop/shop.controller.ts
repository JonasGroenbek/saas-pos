import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ShopService } from './shop.service';

@Controller()
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('/:id')
  getById(@Param('id', new ParseIntPipe()) id: number) {
    this.shopService.getById(id);
  }
}
