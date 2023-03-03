import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './shop.entity';
import { ShopRepository } from './shop.repository';
import { ShopService } from './shop.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shop])],
  providers: [ShopService, ShopRepository],
  exports: [ShopService],
})
export class ShopModule {}
