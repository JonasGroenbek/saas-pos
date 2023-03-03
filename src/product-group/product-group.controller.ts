import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductGroupService } from './product-group.service';

@Controller()
export class ProductGroupController {
  constructor(private readonly productGroupService: ProductGroupService) {}

  @Get('/:id')
  getById(@Param('id', new ParseIntPipe()) id: number) {
    this.productGroupService.getById(id);
  }
}
