import { Organization } from '../organization/organization.entity';
import { BaseEntity } from '../postgres/base.entity';
import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Sale } from '../sale/sale.entity';
import { StockLevel } from '../stock-level/stock-level.entity';
import { Product } from '../product/product.entity';

@Entity({ name: 'shop' })
export class Shop extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @Column({ name: 'organization_id', type: 'int', nullable: false })
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.shops, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization;

  @OneToMany(() => Sale, (sale) => sale.shop)
  sales: Sale[];

  @OneToMany(() => StockLevel, (stockLevel) => stockLevel.shop)
  stockLevels: StockLevel[];

  @ManyToMany(() => Product)
  products: Product[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  meta?: any;
}
