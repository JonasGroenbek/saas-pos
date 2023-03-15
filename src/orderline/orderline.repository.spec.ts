import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orderline } from './orderline.entity';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { OrderlineRepository } from './orderline.repository';
import {
  clearTestData,
  restartSequences,
  seedTestData,
  testTransaction,
} from '../postgres/seeds/test-data.seed';
import { QueryRunner } from 'typeorm';

describe('orderline.repository.ts', () => {
  let orderlineRepository: OrderlineRepository;
  let testOrderlines: Orderline[] = [];
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeormConfig),
        TypeOrmModule.forFeature([Orderline]),
      ],
      providers: [OrderlineRepository],
    }).compile();

    orderlineRepository = await app.get<OrderlineRepository>(
      OrderlineRepository,
    );

    const queryRunner =
      orderlineRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    testOrderlines = testData.orderlines;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner =
      orderlineRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('OrderlineRepository is defined"', () => {
    expect(orderlineRepository).toBeDefined();
  });

  describe('getOne()', () => {
    it('should throw error when attempting to retrieve a user that does not exist', async () => {
      const nonExistingUserId =
        testOrderlines.reduce((acc, cur) => {
          return acc < cur.id ? cur.id : acc;
        }, 0) + 1;

      testTransaction(
        orderlineRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const orderline = await orderlineRepository.getOne({
            where: { id: nonExistingUserId },
            identity: null,
            queryRunner,
          });

          expect(orderline).toBeNull();
        },
      );
    });

    it('should retrieve an entity', async () => {
      const subject = testOrderlines[0];
      const queryRunner =
        await orderlineRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const orderline = await orderlineRepository.getOne({
          where: { id: subject.id },
          queryRunner,
        });

        expect(orderline).toBeDefined();
        expect(orderline.id).toEqual(subject.id);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('create()', () => {
    it('should create an entity', async () => {
      const subject: Partial<Orderline> = {
        saleId: 1,
        productId: 1,
        amount: 1,
        organizationId: 1,
      };
      const queryRunner =
        await orderlineRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const orderline = await orderlineRepository.insertOne({
          entity: subject,
          queryRunner,
        });

        expect(orderline).toBeDefined();
        expect(orderline).toBeTruthy();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('delete()', () => {
    it('should delete the first entity in seed', async () => {
      const subjectOrderline = testOrderlines[0];

      const queryRunner =
        await orderlineRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const orderline = await orderlineRepository.getOne({
          where: { id: subjectOrderline.id },
          queryRunner,
        });

        expect(orderline).toBeDefined();

        await orderlineRepository.deleteOne({
          id: orderline.id,
          queryRunner,
        });

        const shop = await orderlineRepository.getOne({
          where: { id: subjectOrderline.id },
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
        await orderlineRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const orderlines = await orderlineRepository.getMany({
          queryRunner,
        });

        expect(orderlines.length).toEqual(testOrderlines.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('retrieves 2 when limits to 2', async () => {
      const queryRunner =
        await orderlineRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await orderlineRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testOrderlines.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('getManyWithCount()', () => {
    it('returns all when retrieving all and count is correct', async () => {
      const queryRunner =
        await orderlineRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await orderlineRepository.getManyWithCount({
          queryRunner,
        });

        expect(entities.length).toEqual(testOrderlines.length);
        expect(count).toEqual(testOrderlines.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('get all entities with limit and correct amount', async () => {
      const queryRunner =
        await orderlineRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await orderlineRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testOrderlines.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });
});
