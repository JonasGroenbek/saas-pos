import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductGroup } from './product-group.entity';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { ProductGroupRepository } from './product-group.repository';
import {
  clearTestData,
  restartSequences,
  seedTestData,
} from '../postgres/seeds/test-data.seed';

describe('productGroup.repository.ts', () => {
  let productGroupRepository: ProductGroupRepository;
  let testProductGroups: ProductGroup[] = [];
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeormConfig),
        TypeOrmModule.forFeature([ProductGroup]),
      ],
      providers: [ProductGroupRepository],
    }).compile();

    productGroupRepository = await app.get<ProductGroupRepository>(
      ProductGroupRepository,
    );

    const queryRunner =
      productGroupRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    testProductGroups = testData.productGroups;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner =
      productGroupRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('ProductGroupRepository is defined"', () => {
    expect(productGroupRepository).toBeDefined();
  });

  describe('getOne()', () => {
    it('should throw error when attempting to retrieve not', async () => {
      const queryRunner =
        await productGroupRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const largestId = testProductGroups.reduce((acc, cur) => {
          return acc < cur.id ? cur.id : acc;
        }, 0);

        const productGroup = await productGroupRepository.getOne({
          where: { id: largestId + 1 },
          queryRunner,
        });
        await expect(productGroup).toBeNull();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('should retrieve an entity', async () => {
      const subject = testProductGroups[0];
      const queryRunner =
        await productGroupRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const productGroup = await productGroupRepository.getOne({
          where: { id: subject.id },
          queryRunner,
        });

        expect(productGroup).toBeDefined();
        expect(productGroup.id).toEqual(subject.id);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('create()', () => {
    it('should create an entity', async () => {
      const subject = {
        name: 'test_product_group',
        organizationId: 1,
      };
      const queryRunner =
        await productGroupRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const productGroup = await productGroupRepository.insertOne({
          entity: subject,
          queryRunner,
        });

        expect(productGroup).toBeDefined();
        expect(productGroup.name).toEqual(subject.name);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('delete()', () => {
    it('should delete the first entity in seed', async () => {
      const subjectProductGroup = testProductGroups[0];

      const queryRunner =
        await productGroupRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const productGroup = await productGroupRepository.getOne({
          where: { id: subjectProductGroup.id },
          queryRunner,
        });

        expect(productGroup).toBeDefined();

        await productGroupRepository.deleteOne({
          id: productGroup.id,
          queryRunner,
        });

        const shop = await productGroupRepository.getOne({
          where: { id: subjectProductGroup.id },
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
        await productGroupRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const productGroups = await productGroupRepository.getMany({
          queryRunner,
        });

        expect(productGroups.length).toEqual(testProductGroups.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('retrieves 2 when limits to 2', async () => {
      const queryRunner =
        await productGroupRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } =
          await productGroupRepository.getManyWithCount({
            limit: 2,
            queryRunner,
          });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testProductGroups.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('getManyWithCount()', () => {
    it('returns all when retrieving all and count is correct', async () => {
      const queryRunner =
        await productGroupRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } =
          await productGroupRepository.getManyWithCount({
            queryRunner,
          });

        expect(entities.length).toEqual(testProductGroups.length);
        expect(count).toEqual(testProductGroups.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('get all entities with limit and correct amount', async () => {
      const queryRunner =
        await productGroupRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } =
          await productGroupRepository.getManyWithCount({
            limit: 2,
            queryRunner,
          });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testProductGroups.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });
});
