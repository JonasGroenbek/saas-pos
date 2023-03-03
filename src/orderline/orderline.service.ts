import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner } from 'typeorm';
import { OrderlineRepository } from './orderline.repository';

@Injectable()
export class OrderlineService {
  constructor(
    @InjectRepository(OrderlineRepository)
    public readonly orderlineRepository: OrderlineRepository,
  ) {}

  getById(id: number, queryRunner?: QueryRunner) {
    return this.orderlineRepository.getById(id, queryRunner);
  }
}
