import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner } from 'typeorm';
import { ProductGroupRepository } from './product-group.repository';

@Injectable()
export class ProductGroupService {
  constructor(
    @InjectRepository(ProductGroupRepository)
    public readonly productGroupRepository: ProductGroupRepository,
  ) {}
}
