import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './shop.entity';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { ShopRepository } from './shop.repository';
import {
  clearTestData,
  restartSequences,
  seedTestData,
} from '../postgres/seeds/test-data.seed';
import { Organization } from '../organization/organization.entity';
import { QueryRunner } from 'typeorm';

describe('organization.repository.ts', () => {
  let shopRepository: ShopRepository;
  let testOrganizations: Organization[] = [];
  let app: TestingModule;
  let testShops: Shop[] = [];

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeormConfig),
        TypeOrmModule.forFeature([Shop]),
      ],
      providers: [ShopRepository],
    }).compile();

    shopRepository = app.get<ShopRepository>(ShopRepository);

    const queryRunner = shopRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    testShops = testData.shops;
    testOrganizations = testData.organizations;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner = shopRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('ShopRepository is defined"', () => {
    expect(ShopRepository).toBeDefined();
  });

  describe('getOne()', () => {
    it('should throw error when attempting to retrieve not', async () => {
      const queryRunner =
        await shopRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const largestId = testShops.reduce((acc, cur) => {
          return acc < cur.id ? cur.id : acc;
        }, 0);

        const organization = await shopRepository.getOne({
          where: { id: largestId + 1 },
          queryRunner,
        });
        await expect(organization).toBeNull();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('should retrieve an entity', async () => {
      const subject = testShops[0];
      const queryRunner =
        await shopRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const organization = await shopRepository.getOne({
          where: { id: subject.id },
          queryRunner,
        });

        expect(organization).toBeDefined();
        expect(organization.id).toEqual(subject.id);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('create()', () => {
    it('should create an entity', async () => {
      const subject: Partial<Shop> = {
        name: 'inserted_shop',
        organizationId: testOrganizations[0].id,
      };
      const queryRunner =
        await shopRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const organization = await shopRepository.insertOne({
          entity: subject,
          queryRunner,
        });

        expect(organization).toBeDefined();
        expect(organization.name).toEqual(subject.name);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('delete()', () => {
    it('should delete the first entity in seed', async () => {
      const subjectOrganization = testShops[0];

      const queryRunner =
        await shopRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const organization = await shopRepository.getOne({
          where: { id: subjectOrganization.id },
          queryRunner,
        });

        expect(organization).toBeDefined();

        await shopRepository.deleteOne({
          id: organization.id,
          queryRunner,
        });

        const shop = await shopRepository.getOne({
          where: { id: subjectOrganization.id },
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
        await shopRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const organizations = await shopRepository.getMany({
          queryRunner,
        });

        expect(organizations.length).toEqual(testShops.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('retrieves 2 when limits to 2', async () => {
      const queryRunner =
        await shopRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await shopRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testShops.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('getManyWithCount()', () => {
    it('returns all when retrieving all and count is correct', async () => {
      const queryRunner =
        await shopRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await shopRepository.getManyWithCount({
          queryRunner,
        });

        expect(entities.length).toEqual(testShops.length);
        expect(count).toEqual(testShops.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('get all entities with limit and correct amount', async () => {
      const queryRunner =
        await shopRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await shopRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testShops.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });
});
