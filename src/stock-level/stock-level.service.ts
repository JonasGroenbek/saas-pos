import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockLevelRepository } from './stock-level.repository';

@Injectable()
export class StockLevelService {
  constructor(
    @InjectRepository(StockLevelRepository)
    public readonly stockLevelRepository: StockLevelRepository,
  ) {}
}
