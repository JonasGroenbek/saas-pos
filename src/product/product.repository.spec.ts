import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { ProductRepository } from './product.repository';
import {
  clearTestData,
  restartSequences,
  seedTestData,
} from '../postgres/seeds/test-data.seed';

describe('product.repository.ts', () => {
  let productRepository: ProductRepository;
  let testProducts: Product[] = [];
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeormConfig),
        TypeOrmModule.forFeature([Product]),
      ],
      providers: [ProductRepository],
    }).compile();

    productRepository = await app.get<ProductRepository>(ProductRepository);

    const queryRunner =
      productRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    testProducts = testData.products;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner =
      productRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('ProductRepository is defined"', () => {
    expect(productRepository).toBeDefined();
  });

  describe('getOne()', () => {
    it('should throw error when attempting to retrieve not', async () => {
      const queryRunner =
        await productRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const largestId = testProducts.reduce((acc, cur) => {
          return acc < cur.id ? cur.id : acc;
        }, 0);

        const product = await productRepository.getOne({
          where: { id: largestId + 1 },
          queryRunner,
        });
        await expect(product).toBeNull();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('should retrieve an entity', async () => {
      const subject = testProducts[0];
      const queryRunner =
        await productRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const product = await productRepository.getOne({
          where: { id: subject.id },
          queryRunner,
        });

        expect(product).toBeDefined();
        expect(product.id).toEqual(subject.id);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('create()', () => {
    it('should create an entity', async () => {
      const subject = {
        productGroupId: 1,
        name: 'test_product',
        price: 100,
        organizationId: 1,
      };
      const queryRunner =
        await productRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const product = await productRepository.insertOne({
          entity: subject,
          queryRunner,
        });

        expect(product).toBeDefined();
        expect(product.name).toEqual(subject.name);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('delete()', () => {
    it('should delete the first entity in seed', async () => {
      const subjectProduct = testProducts[0];

      const queryRunner =
        await productRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const product = await productRepository.getOne({
          where: { id: subjectProduct.id },
          queryRunner,
        });

        expect(product).toBeDefined();

        await productRepository.deleteOne({
          id: product.id,
          queryRunner,
        });

        const shop = await productRepository.getOne({
          where: { id: subjectProduct.id },
          queryRunner,
        });

        await expect(shop).toBeNull();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('getMany()', () => {
    it('returns all when retrieving all', async () => {
      const queryRunner =
        await productRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const products = await productRepository.getMany({
          queryRunner,
        });

        expect(products.length).toEqual(testProducts.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('retrieves 2 when limits to 2', async () => {
      const queryRunner =
        await productRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await productRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testProducts.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('getManyWithCount()', () => {
    it('returns all when retrieving all and count is correct', async () => {
      const queryRunner =
        await productRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await productRepository.getManyWithCount({
          queryRunner,
        });

        expect(entities.length).toEqual(testProducts.length);
        expect(count).toEqual(testProducts.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('get all entities with limit and correct amount', async () => {
      const queryRunner =
        await productRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await productRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testProducts.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });
});
