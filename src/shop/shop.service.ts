import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner } from 'typeorm';
import { Shop } from './shop.entity';
import { ShopRepository } from './shop.repository';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    public readonly shopRepository: ShopRepository,
  ) {}

  getById(id: number, queryRunner?: QueryRunner) {
    return this.shopRepository.getById(id, queryRunner);
  }

  getOne(id: number, queryRunner?: QueryRunner) {
    return this.shopRepository.getById(id, queryRunner);
  }
}
