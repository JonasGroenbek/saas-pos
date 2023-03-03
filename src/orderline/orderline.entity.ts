import { Organization } from '../organization/organization.entity';
import { BaseEntity } from '../postgres/base.entity';
import { ColumnNumericTransformer } from '../postgres/transformers/numeric.transformer';
import { Product } from '../product/product.entity';
import { Sale } from '../sale/sale.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OrderlineType {
  Return = 'return',
  Sale = 'sale',
}

@Entity({ name: 'orderline' })
export class Orderline extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Organization, (organization) => organization.orderlines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization;

  @Column({ name: 'organization_id', type: 'int', nullable: false })
  organizationId: number;

  @Column({
    type: 'enum',
    enum: OrderlineType,
    default: OrderlineType.Sale,
    name: 'orderline_type',
  })
  orderlineType: OrderlineType;

  @Column('numeric', {
    precision: 10,
    scale: 3,
    nullable: false,
    name: 'amount',
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column('numeric', {
    precision: 10,
    scale: 3,
    nullable: true,
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

  @Column({ name: 'product_id', type: 'int', nullable: false })
  productId: number;

  @ManyToOne(() => Product, (product) => product.orderlines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product;

  @Column({ name: 'sale_id', type: 'int', nullable: false })
  saleId: number;

  @ManyToOne(() => Sale, (sale) => sale.orderlines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sale_id', referencedColumnName: 'id' })
  sale: Sale;
}
