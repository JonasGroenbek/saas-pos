import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './sale.entity';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { SaleRepository } from './sale.repository';
import {
  clearTestData,
  restartSequences,
  seedTestData,
} from '../postgres/seeds/test-data.seed';

describe('sale.repository.ts', () => {
  let saleRepository: SaleRepository;
  let testSales: Sale[] = [];
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeormConfig),
        TypeOrmModule.forFeature([Sale]),
      ],
      providers: [SaleRepository],
    }).compile();

    saleRepository = await app.get<SaleRepository>(SaleRepository);

    const queryRunner = saleRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    testSales = testData.sales;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner = saleRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('SaleRepository is defined"', () => {
    expect(saleRepository).toBeDefined();
  });

  describe('getOne()', () => {
    it('should throw error when attempting to retrieve not', async () => {
      const queryRunner =
        await saleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const largestId = testSales.reduce((acc, cur) => {
          return acc < cur.id ? cur.id : acc;
        }, 0);

        const sale = await saleRepository.getOne({
          where: { id: largestId + 1 },
          queryRunner,
        });
        await expect(sale).toBeNull();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('should retrieve an entity', async () => {
      const subject = testSales[0];
      const queryRunner =
        await saleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const sale = await saleRepository.getOne({
          where: { id: subject.id },
          queryRunner,
        });

        expect(sale).toBeDefined();
        expect(sale.id).toEqual(subject.id);
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
        totalAmount: 0,
      };
      const queryRunner =
        await saleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const sale = await saleRepository.insertOne({
          entity: subject,
          queryRunner,
        });

        expect(sale).toBeTruthy();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('delete()', () => {
    it('should delete the first entity in seed', async () => {
      const subjectSale = testSales[0];

      const queryRunner =
        await saleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const sale = await saleRepository.getOne({
          where: { id: subjectSale.id },
          queryRunner,
        });

        expect(sale).toBeDefined();

        await saleRepository.deleteOne({
          id: sale.id,
          queryRunner,
        });

        const shop = await saleRepository.getOne({
          where: { id: subjectSale.id },
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
        await saleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const sales = await saleRepository.getMany({
          queryRunner,
        });

        expect(sales.length).toEqual(testSales.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('retrieves 2 when limits to 2', async () => {
      const queryRunner =
        await saleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await saleRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testSales.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('getManyWithCount()', () => {
    it('returns all when retrieving all and count is correct', async () => {
      const queryRunner =
        await saleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await saleRepository.getManyWithCount({
          queryRunner,
        });

        expect(entities.length).toEqual(testSales.length);
        expect(count).toEqual(testSales.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('get all entities with limit and correct amount', async () => {
      const queryRunner =
        await saleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await saleRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testSales.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });
});
