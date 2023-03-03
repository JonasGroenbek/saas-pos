import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner } from 'typeorm';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductRepository)
    public readonly productRepository: ProductRepository,
  ) {}

  getById(id: number, queryRunner?: QueryRunner) {
    return this.productRepository.getById(id, queryRunner);
  }
}
