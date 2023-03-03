import { Organization } from '../organization/organization.entity';
import { BaseEntity } from '../postgres/base.entity';
import { Product } from '../product/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'product_group' })
export class ProductGroup extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @ManyToOne(() => Organization, (organization) => organization.productGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization;

  @Column({ name: 'organization_id', type: 'int', nullable: false })
  organizationId: number;

  @OneToMany(() => Product, (product) => product.productGroup)
  products: Product[];
}
