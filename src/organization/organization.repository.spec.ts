import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './organization.entity';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { OrganizationRepository } from './organization.repository';
import {
  clearTestData,
  restartSequences,
  seedTestData,
} from '../postgres/seeds/test-data.seed';

describe('organization.repository.ts', () => {
  let organizationRepository: OrganizationRepository;
  let testOrganizations: Organization[] = [];
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeormConfig),
        TypeOrmModule.forFeature([Organization]),
      ],
      providers: [OrganizationRepository],
    }).compile();

    organizationRepository = await app.get<OrganizationRepository>(
      OrganizationRepository,
    );

    const queryRunner =
      organizationRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    testOrganizations = testData.organizations;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner =
      organizationRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('OrganizationRepository is defined"', () => {
    expect(organizationRepository).toBeDefined();
  });

  describe('getOne()', () => {
    it('should throw error when attempting to retrieve not', async () => {
      const queryRunner =
        await organizationRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const largestId = testOrganizations.reduce((acc, cur) => {
          return acc < cur.id ? cur.id : acc;
        }, 0);

        const organization = await organizationRepository.getOne({
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
      const subject = testOrganizations[0];
      const queryRunner =
        await organizationRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const organization = await organizationRepository.getOne({
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
      const subject = { name: 'inserted_org' };
      const queryRunner =
        await organizationRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const organization = await organizationRepository.insertOne({
          entity: { name: 'inserted_org' },
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
      const subjectOrganization = testOrganizations[0];

      const queryRunner =
        await organizationRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const organization = await organizationRepository.getOne({
          where: { id: subjectOrganization.id },
          queryRunner,
        });

        expect(organization).toBeDefined();

        await organizationRepository.deleteOne({
          id: organization.id,
          queryRunner,
        });

        const shop = await organizationRepository.getOne({
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
        await organizationRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const organizations = await organizationRepository.getMany({
          queryRunner,
        });

        expect(organizations.length).toEqual(testOrganizations.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('retrieves 2 when limits to 2', async () => {
      const queryRunner =
        await organizationRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } =
          await organizationRepository.getManyWithCount({
            limit: 2,
            queryRunner,
          });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testOrganizations.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('getManyWithCount()', () => {
    it('returns all when retrieving all and count is correct', async () => {
      const queryRunner =
        await organizationRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } =
          await organizationRepository.getManyWithCount({
            queryRunner,
          });

        expect(entities.length).toEqual(testOrganizations.length);
        expect(count).toEqual(testOrganizations.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('get all entities with limit and correct amount', async () => {
      const queryRunner =
        await organizationRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } =
          await organizationRepository.getManyWithCount({
            limit: 2,
            queryRunner,
          });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testOrganizations.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });
});
