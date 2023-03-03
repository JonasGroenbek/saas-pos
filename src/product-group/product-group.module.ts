import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductGroup } from './product-group.entity';
import { ProductGroupRepository } from './product-group.repository';
import { ProductGroupService } from './product-group.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductGroup])],
  providers: [ProductGroupService, ProductGroupRepository],
  exports: [ProductGroupService],
})
export class ProductGroupModule {}
