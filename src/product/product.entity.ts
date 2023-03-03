import { Orderline } from '../orderline/orderline.entity';
import { Organization } from '../organization/organization.entity';
import { BaseEntity } from '../postgres/base.entity';
import { ColumnNumericTransformer } from '../postgres/transformers/numeric.transformer';
import { ProductGroup } from '../product-group/product-group.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockLevel } from '../stock-level/stock-level.entity';

@Index('barcode_organization_id', ['barcode', 'organizationId'], {
  unique: true,
})
@Entity({ name: 'product' })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @Column({ type: 'varchar', name: 'barcode', nullable: true })
  barcode: string;

  @Column({ name: 'organization_id', type: 'int', nullable: false })
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization;

  @OneToMany(() => StockLevel, (stockLevel) => stockLevel.product, {
    onDelete: 'CASCADE',
  })
  stockLevels: StockLevel[];

  @OneToMany(() => Orderline, (orderlines) => orderlines.product, {
    onDelete: 'CASCADE',
  })
  orderlines: Orderline[];

  @Column('numeric', {
    precision: 14,
    scale: 3,
    nullable: false,
    name: 'price',
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({ name: 'product_group_id', type: 'int', nullable: false })
  productGroupId: number;

  @ManyToOne(() => ProductGroup, (productGroup) => productGroup.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_group_id', referencedColumnName: 'id' })
  productGroup: ProductGroup;
}
