import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/:id')
  getById(@Param('id', new ParseIntPipe()) id: number) {
    this.productService.getById(id);
  }
}
