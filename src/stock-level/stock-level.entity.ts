import { Organization } from '../organization/organization.entity';
import { BaseEntity } from '../postgres/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shop } from '../shop/shop.entity';
import { ColumnNumericTransformer } from '../postgres/transformers/numeric.transformer';
import { Product } from '../product/product.entity';

@Entity({ name: 'stock_level' })
export class StockLevel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('numeric', {
    precision: 10,
    scale: 3,
    nullable: true,
    name: 'amount',
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ name: 'organization_id', type: 'int', nullable: false })
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.stockLevels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization;

  @Column({ name: 'product_id', type: 'int', nullable: false })
  productId: number;

  @ManyToOne(() => Product, (product) => product.stockLevels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product;

  @Column({ name: 'shop_id', type: 'int', nullable: false })
  shopId: number;

  @ManyToOne(() => Shop, (shop) => shop.stockLevels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop;
}
