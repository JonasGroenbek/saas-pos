import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockLevel } from './stock-level.entity';
import { StockLevelRepository } from './stock-level.repository';
import { StockLevelService } from './stock-level.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockLevel])],
  providers: [StockLevelService, StockLevelRepository],
  exports: [StockLevelService],
})
export class StockLevelModule {}
