import { Organization } from '../../organization/organization.entity';
import { Shop } from '../../shop/shop.entity';
import { DataSource, QueryRunner } from 'typeorm';
import { Role } from '../../role/role.entity';
import { User } from '../../user/user.entity';
import { Product } from '../../product/product.entity';
import { StockLevel } from '../../stock-level/stock-level.entity';
import { ProductGroup } from '../../product-group/product-group.entity';
import { Orderline, OrderlineType } from '../../orderline/orderline.entity';
import { Transaction } from '../../transaction/transaction.entity';
import { Sale } from '../../sale/sale.entity';
import 'dotenv/config';
import { Policy } from '../../enums/policy.enum';
import { Identity } from '../../auth/interfaces/identity-token-payload';

type RecursivePartial<T> = {
  readonly [P in keyof T]?: RecursivePartial<T[P]>;
};

export const testTransaction = async (
  datasource: DataSource,
  callback: (queryRunner: QueryRunner) => any,
) => {
  const queryRunner = datasource.createQueryRunner();
  try {
    await queryRunner.startTransaction();
    const result = await callback(queryRunner);
    return result;
  } catch (e) {
    throw e;
  } finally {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }
};

export const seed: RecursivePartial<Organization>[] = [
  {
    id: 1,
    name: 'org_1',
    shops: [
      { id: 1, organizationId: 1, name: 'shop_1' },
      { id: 2, organizationId: 1, name: 'shop_2' },
    ],
    roles: [
      { id: 1, organizationId: 1, name: 'admin' },
      { id: 2, organizationId: 1, name: 'employee' },
    ],
    stockLevels: [
      { id: 1, shopId: 1, organizationId: 1, productId: 1 },
      { id: 2, shopId: 1, organizationId: 1, productId: 2 },
      { id: 3, shopId: 2, organizationId: 1, productId: 1 },
      { id: 4, shopId: 2, organizationId: 1, productId: 2 },
    ],
    users: [
      {
        id: 1,
        firstName: 'user_1',
        lastName: 'user_1',
        email: 'someone1@email.com',
        password: 'password1',
        organizationId: 1,
        roleId: 1,
      },
      {
        id: 2,
        firstName: 'user_2',
        lastName: 'user_2',
        email: 'someone2@email.com',
        password: 'password2',
        organizationId: 1,
        roleId: 2,
      },
    ],
    productGroups: [
      { id: 1, name: 'product_group_1', organizationId: 1 },
      { id: 2, name: 'product_group_2', organizationId: 1 },
    ],
    products: [
      {
        id: 1,
        productGroupId: 1,
        name: 'product_1',
        price: 100,
        organizationId: 1,
      },
      {
        id: 2,
        productGroupId: 2,
        name: 'product_2',
        price: 100,
        organizationId: 1,
      },
    ],
    sales: [
      {
        id: 1,
        discountAmount: 0,
        discountPercentage: 0,
        totalAmount: 200,
        organizationId: 1,
      },
      {
        id: 2,
        discountAmount: 0,
        discountPercentage: 0,
        totalAmount: 200,
        organizationId: 1,
      },
    ],
    orderlines: [
      {
        id: 1,
        saleId: 1,
        amount: 1,
        productId: 1,
        orderlineType: OrderlineType.Sale,
        organizationId: 1,
      },
      {
        id: 2,
        saleId: 1,
        amount: 1,
        productId: 2,
        orderlineType: OrderlineType.Sale,
        organizationId: 1,
      },
      {
        id: 3,
        saleId: 2,
        amount: 1,
        productId: 1,
        orderlineType: OrderlineType.Sale,
        organizationId: 1,
      },
      {
        id: 4,
        saleId: 2,
        amount: 1,
        productId: 2,
        orderlineType: OrderlineType.Sale,
        organizationId: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'org_2',
    roles: [
      { id: 3, organizationId: 2, name: 'admin' },
      { id: 4, organizationId: 2, name: 'employee' },
    ],
    users: [
      {
        id: 3,
        firstName: 'user_3',
        lastName: 'user_3',
        email: 'someone3@email.com',
        password: 'password3',
        organizationId: 2,
        roleId: 3,
      },
      {
        id: 4,
        firstName: 'user_4',
        lastName: 'user_4',
        email: 'someone4@email.com',
        password: 'password4',
        organizationId: 2,
        roleId: 4,
      },
    ],
    stockLevels: [
      { id: 5, shopId: 3, organizationId: 2, productId: 3 },
      { id: 6, shopId: 3, organizationId: 2, productId: 4 },
      { id: 7, shopId: 4, organizationId: 2, productId: 5 },
      { id: 8, shopId: 4, organizationId: 2, productId: 6 },
    ],
    shops: [
      { id: 3, organizationId: 2, name: 'shop_3' },
      { id: 4, organizationId: 2, name: 'shop_4' },
    ],
    productGroups: [
      { id: 3, name: 'product_group_3', organizationId: 1 },
      { id: 4, name: 'product_group_4', organizationId: 1 },
    ],
    products: [
      {
        id: 3,
        productGroupId: 3,
        name: 'product_3',
        price: 100,
        organizationId: 2,
      },
      {
        id: 4,
        productGroupId: 3,
        name: 'product_4',
        price: 100,
        organizationId: 2,
      },
      {
        id: 5,
        productGroupId: 4,
        name: 'product_5',
        price: 100,
        organizationId: 2,
      },
      {
        id: 6,
        productGroupId: 4,
        name: 'product_6',
        price: 100,
        organizationId: 2,
      },
    ],
    sales: [
      {
        id: 3,
        discountAmount: 0,
        discountPercentage: 0,
        totalAmount: 400,
        organizationId: 2,
      },
      {
        id: 4,
        discountAmount: 0,
        discountPercentage: 0,
        totalAmount: 200,
        organizationId: 2,
      },
    ],
    orderlines: [
      {
        id: 5,
        saleId: 3,
        amount: 1,
        productId: 3,
        orderlineType: OrderlineType.Sale,
        organizationId: 2,
      },
      {
        id: 6,
        saleId: 3,
        amount: 1,
        productId: 4,
        orderlineType: OrderlineType.Sale,
        organizationId: 2,
      },
      {
        id: 7,
        saleId: 3,
        amount: 1,
        productId: 5,
        orderlineType: OrderlineType.Sale,
        organizationId: 2,
      },
      {
        id: 8,
        saleId: 3,
        amount: 1,
        productId: 6,
        orderlineType: OrderlineType.Sale,
        organizationId: 2,
      },
      {
        id: 9,
        saleId: 4,
        amount: 1,
        productId: 5,
        orderlineType: OrderlineType.Sale,
        organizationId: 2,
      },
      {
        id: 10,
        saleId: 4,
        amount: 1,
        productId: 6,
        orderlineType: OrderlineType.Sale,
        organizationId: 2,
      },
    ],
  },
];

export const TEST_IDENTITIES: {
  [key in 'org1user1' | 'org1user2' | 'org2user3' | 'org2user4']: Identity;
} = {
  org1user1: {
    userId: seed[0].users[0].id,
    organizationId: seed[0].id,
    roleId: seed[0].users[0].roleId,
    policies: seed[0].roles[0].policies as Policy[],
  },
  org1user2: {
    userId: seed[0].users[1].id,
    organizationId: seed[0].id,
    roleId: seed[0].users[1].roleId,
    policies: seed[0].roles[1].policies as Policy[],
  },
  org2user3: {
    userId: seed[1].users[0].id,
    organizationId: seed[1].id,
    roleId: seed[1].users[0].roleId,
    policies: seed[1].roles[0].policies as Policy[],
  },
  org2user4: {
    userId: seed[1].users[1].id,
    organizationId: seed[1].id,
    roleId: seed[1].users[1].roleId,
    policies: seed[1].roles[1].policies as Policy[],
  },
};

export async function seedTestData(queryRunner: QueryRunner) {
  await clearTestData(queryRunner);

  const organizations = await seedOrganizations(queryRunner);
  const shops = await seedShops(queryRunner);
  const roles = await seedRoles(queryRunner);
  const users = await seedUsers(queryRunner);
  const sales = await seedSales(queryRunner);
  const productGroups = await seedProductGroups(queryRunner);
  const products = await seedProducts(queryRunner);
  const orderlines = await seedOrderlines(queryRunner);
  const stockLevels = await seedStockLevels(queryRunner);

  return {
    organizations,
    shops,
    sales,
    users,
    roles,
    productGroups,
    orderlines,
    stockLevels,
    products,
  };
}

export async function seedOrganizations(
  queryRunner: QueryRunner,
): Promise<Organization[]> {
  const shopRepository = queryRunner.manager.getRepository(Organization);

  const organizationSeed = [];
  seed.forEach((organization) => {
    const { id, name, ...rest } = organization;
    organizationSeed.push({ id, name });
  });

  const organizations = await shopRepository.save<Organization>(
    seed as Organization[],
  );

  return organizations;
}

export async function seedShops(queryRunner: QueryRunner): Promise<Shop[]> {
  const shopRepository = queryRunner.manager.getRepository(Shop);
  let shopSeed = [];
  for (const organization of seed) {
    shopSeed = [...shopSeed, ...organization.shops];
  }

  const shops = await shopRepository.save<Shop>(shopSeed);

  return shops;
}

export async function seedSales(queryRunner: QueryRunner): Promise<Sale[]> {
  const saleRepository = queryRunner.manager.getRepository(Sale);
  let saleSeed = [];
  for (const organization of seed) {
    saleSeed = [...saleSeed, ...organization.sales];
  }
  const sales = await saleRepository.save<Sale>(saleSeed);

  return sales;
}

export async function seedProducts(
  queryRunner: QueryRunner,
): Promise<Product[]> {
  const productRepository = queryRunner.manager.getRepository(Product);
  let productSeed = [];
  for (const organization of seed) {
    productSeed = [...productSeed, ...organization.products];
  }
  const products = await productRepository.save<Product>(productSeed);

  return products;
}

export async function seedProductGroups(
  queryRunner: QueryRunner,
): Promise<ProductGroup[]> {
  const productRepository = queryRunner.manager.getRepository(ProductGroup);
  let productGroupSeed = [];
  for (const organization of seed) {
    productGroupSeed = [...productGroupSeed, ...organization.products];
  }
  const productGroups = await productRepository.save<ProductGroup>(
    productGroupSeed,
  );

  return productGroups;
}

export async function seedUsers(queryRunner: QueryRunner): Promise<User[]> {
  const userRepository = queryRunner.manager.getRepository(User);
  let userSeed = [];
  for (const organization of seed) {
    userSeed = [...userSeed, ...organization.users];
  }
  const users = await userRepository.save<User>(userSeed);

  return users;
}

export async function seedRoles(queryRunner: QueryRunner): Promise<Role[]> {
  const roleRepository = queryRunner.manager.getRepository(Role);
  let roleSeed = [];
  for (const organization of seed) {
    roleSeed = [...roleSeed, ...organization.roles];
  }
  const roles = await roleRepository.save<Shop>(roleSeed);

  return roles;
}

export async function seedOrderlines(
  queryRunner: QueryRunner,
): Promise<Orderline[]> {
  const orderlineRepository = queryRunner.manager.getRepository(Orderline);
  let orderlineSeed = [];
  for (const organization of seed) {
    orderlineSeed = [...orderlineSeed, ...organization.orderlines];
  }
  const roles = await orderlineRepository.save<Orderline>(orderlineSeed);

  return roles;
}

export async function seedStockLevels(
  queryRunner: QueryRunner,
): Promise<StockLevel[]> {
  const stockLevelRepository = queryRunner.manager.getRepository(StockLevel);
  let stockLevelSeed = [];
  for (const organization of seed) {
    stockLevelSeed = [...stockLevelSeed, ...organization.stockLevels];
  }
  const roles = await stockLevelRepository.save<StockLevel>(stockLevelSeed);

  return roles;
}

export async function restartSequences(queryRunner: QueryRunner) {
  await queryRunner.query(`
    ALTER SEQUENCE orderline_id_seq RESTART;
    ALTER SEQUENCE organization_id_seq RESTART;
    ALTER SEQUENCE product_group_id_seq RESTART;
    ALTER SEQUENCE product_id_seq RESTART;
    ALTER SEQUENCE role_id_seq RESTART;
    ALTER SEQUENCE sale_id_seq RESTART;
    ALTER SEQUENCE shop_id_seq RESTART;
    ALTER SEQUENCE stock_level_id_seq RESTART;
    ALTER SEQUENCE transaction_id_seq RESTART;
    ALTER SEQUENCE user_id_seq RESTART;
`);
}

export async function clearTestData(queryRunner: QueryRunner) {
  await queryRunner.manager
    .getRepository(Shop)
    .createQueryBuilder()
    .delete()
    .where('1 = 1')
    .execute();

  await queryRunner.manager
    .getRepository(Organization)
    .createQueryBuilder()
    .delete()
    .where('1 = 1')
    .execute();

  await queryRunner.manager
    .getRepository(Role)
    .createQueryBuilder()
    .delete()
    .where('1 = 1')
    .execute();

  await queryRunner.manager
    .getRepository(User)
    .createQueryBuilder()
    .delete()
    .where('1 = 1')
    .execute();

  await queryRunner.manager
    .getRepository(Product)
    .createQueryBuilder()
    .delete()
    .where('1 = 1')
    .execute();

  await queryRunner.manager
    .getRepository(StockLevel)
    .createQueryBuilder()
    .delete()
    .where('1 = 1')
    .execute();

  await queryRunner.manager
    .getRepository(Sale)
    .createQueryBuilder()
    .delete()
    .where('1 = 1')
    .execute();

  await queryRunner.manager
    .getRepository(Orderline)
    .createQueryBuilder()
    .delete()
    .where('1 = 1')
    .execute();

  await queryRunner.manager
    .getRepository(Transaction)
    .createQueryBuilder()
    .delete()
    .where('1 = 1')
    .execute();

  await queryRunner.manager
    .getRepository(ProductGroup)
    .createQueryBuilder()
    .delete()
    .where('1 = 1')
    .execute();
}
