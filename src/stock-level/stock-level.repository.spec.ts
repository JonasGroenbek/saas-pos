import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockLevel } from './stock-level.entity';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { StockLevelRepository } from './stock-level.repository';
import {
  clearTestData,
  restartSequences,
  seedTestData,
} from '../postgres/seeds/test-data.seed';

describe('stockLevel.repository.ts', () => {
  let stockLevelRepository: StockLevelRepository;
  let testStockLevels: StockLevel[] = [];
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeormConfig),
        TypeOrmModule.forFeature([StockLevel]),
      ],
      providers: [StockLevelRepository],
    }).compile();

    stockLevelRepository = await app.get<StockLevelRepository>(
      StockLevelRepository,
    );

    const queryRunner =
      stockLevelRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    testStockLevels = testData.stockLevels;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner =
      stockLevelRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('StockLevelRepository is defined"', () => {
    expect(stockLevelRepository).toBeDefined();
  });

  describe('getOne()', () => {
    it('should throw error when attempting to retrieve not', async () => {
      const queryRunner =
        await stockLevelRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const largestId = testStockLevels.reduce((acc, cur) => {
          return acc < cur.id ? cur.id : acc;
        }, 0);

        const stockLevel = await stockLevelRepository.getOne({
          where: { id: largestId + 1 },
          queryRunner,
        });
        await expect(stockLevel).toBeNull();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('should retrieve an entity', async () => {
      const subject = testStockLevels[0];
      const queryRunner =
        await stockLevelRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const stockLevel = await stockLevelRepository.getOne({
          where: { id: subject.id },
          queryRunner,
        });

        expect(stockLevel).toBeDefined();
        expect(stockLevel.id).toEqual(subject.id);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('create()', () => {
    it('should create an entity', async () => {
      const subject: Partial<StockLevel> = {
        organizationId: 1,
        productId: 1,
        amount: 10,
        shopId: 1,
      };
      const queryRunner =
        await stockLevelRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const stockLevel = await stockLevelRepository.insertOne({
          entity: subject,
          queryRunner,
        });

        expect(stockLevel).toBeTruthy();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('delete()', () => {
    it('should delete the first entity in seed', async () => {
      const subjectStockLevel = testStockLevels[0];

      const queryRunner =
        await stockLevelRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const stockLevel = await stockLevelRepository.getOne({
          where: { id: subjectStockLevel.id },
          queryRunner,
        });

        expect(stockLevel).toBeDefined();

        await stockLevelRepository.deleteOne({
          id: stockLevel.id,
          queryRunner,
        });

        const shop = await stockLevelRepository.getOne({
          where: { id: subjectStockLevel.id },
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
        await stockLevelRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const stockLevels = await stockLevelRepository.getMany({
          queryRunner,
        });

        expect(stockLevels.length).toEqual(testStockLevels.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('retrieves 2 when limits to 2', async () => {
      const queryRunner =
        await stockLevelRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await stockLevelRepository.getManyWithCount(
          {
            limit: 2,
            queryRunner,
          },
        );
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testStockLevels.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('getManyWithCount()', () => {
    it('returns all when retrieving all and count is correct', async () => {
      const queryRunner =
        await stockLevelRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await stockLevelRepository.getManyWithCount(
          {
            queryRunner,
          },
        );

        expect(entities.length).toEqual(testStockLevels.length);
        expect(count).toEqual(testStockLevels.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('get all entities with limit and correct amount', async () => {
      const queryRunner =
        await stockLevelRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await stockLevelRepository.getManyWithCount(
          {
            limit: 2,
            queryRunner,
          },
        );
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testStockLevels.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });
});
