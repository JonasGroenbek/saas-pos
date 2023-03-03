import { Shop } from '../shop/shop.entity';
import { BaseEntity } from '../postgres/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product/product.entity';
import { StockLevel } from '../stock-level/stock-level.entity';
import { User } from '../user/user.entity';
import { Transaction } from '../transaction/transaction.entity';
import { Sale } from '../sale/sale.entity';
import { ProductGroup } from '../product-group/product-group.entity';
import { Role } from '../role/role.entity';
import { Orderline } from '../orderline/orderline.entity';

@Entity({ name: 'organization' })
export class Organization extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @OneToMany(() => Shop, (shop) => shop.organization)
  shops: Shop[];

  @OneToMany(() => Product, (product) => product.organization)
  products: Product[];

  @OneToMany(() => StockLevel, (stockLevel) => stockLevel.organization)
  stockLevels: StockLevel[];

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Transaction, (transaction) => transaction.organization)
  transactions: Transaction[];

  @OneToMany(() => Sale, (sale) => sale.organization)
  sales: Sale[];

  @OneToMany(() => Orderline, (orderline) => orderline.organization)
  orderlines: Orderline[];

  @OneToMany(() => ProductGroup, (productGroup) => productGroup.organization)
  productGroups: ProductGroup[];

  @OneToMany(() => Role, (role) => role.organization)
  roles: Role[];
}
