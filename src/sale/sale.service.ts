import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner } from 'typeorm';
import { SaleRepository } from './sale.repository';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(SaleRepository)
    public readonly saleRepository: SaleRepository,
  ) {}

  getById(id: number, queryRunner?: QueryRunner) {
    return this.saleRepository.getById(id, queryRunner);
  }
}
