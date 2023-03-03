import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orderline } from './orderline.entity';
import { OrderlineRepository } from './orderline.repository';
import { OrderlineService } from './orderline.service';

@Module({
  imports: [TypeOrmModule.forFeature([Orderline])],
  providers: [OrderlineService, OrderlineRepository],
  exports: [OrderlineService],
})
export class OrderlineModule {}
