import { Orderline } from '../orderline/orderline.entity';
import { Organization } from '../organization/organization.entity';
import { BaseEntity } from '../postgres/base.entity';
import { ColumnNumericTransformer } from '../postgres/transformers/numeric.transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shop } from '../shop/shop.entity';

@Entity({ name: 'sale' })
export class Sale extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'organization_id', type: 'int', nullable: false })
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.sales, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization;

  @Column({ name: 'shop_id', type: 'int', nullable: true })
  shopId: number;

  @ManyToOne(() => Shop, (shop) => shop.sales, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop;

  @Column('numeric', {
    precision: 10,
    scale: 3,
    nullable: true,
    default: 0,
    name: 'discount_percentage',
    transformer: new ColumnNumericTransformer(),
  })
  discountPercentage: number;

  @Column('numeric', {
    precision: 10,
    scale: 3,
    nullable: true,
    default: 0,
    name: 'discount_amount',
    transformer: new ColumnNumericTransformer(),
  })
  discountAmount: number;

  @Column('numeric', {
    precision: 14,
    scale: 3,
    nullable: false,
    default: 0,
    name: 'total_amount',
    transformer: new ColumnNumericTransformer(),
  })
  totalAmount: number;

  @OneToMany(() => Orderline, (orderlines) => orderlines.sale, {
    onDelete: 'CASCADE',
  })
  orderlines: Orderline[];
}
