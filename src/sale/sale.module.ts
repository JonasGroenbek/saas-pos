import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './sale.entity';
import { SaleRepository } from './sale.repository';
import { SaleService } from './sale.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sale])],
  providers: [SaleService, SaleRepository],
  exports: [SaleService],
})
export class SaleModule {}
