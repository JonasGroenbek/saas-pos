import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { RoleRepository } from './role.repository';
import {
  clearTestData,
  restartSequences,
  seedTestData,
} from '../postgres/seeds/test-data.seed';

describe('role.repository.ts', () => {
  let roleRepository: RoleRepository;
  let testRoles: Role[] = [];
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeormConfig),
        TypeOrmModule.forFeature([Role]),
      ],
      providers: [RoleRepository],
    }).compile();

    roleRepository = await app.get<RoleRepository>(RoleRepository);

    const queryRunner = roleRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    testRoles = testData.roles;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner = roleRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('RoleRepository is defined"', () => {
    expect(roleRepository).toBeDefined();
  });

  describe('getOne()', () => {
    it('should throw error when attempting to retrieve not', async () => {
      const queryRunner =
        await roleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const largestId = testRoles.reduce((acc, cur) => {
          return acc < cur.id ? cur.id : acc;
        }, 0);

        const role = await roleRepository.getOne({
          where: { id: largestId + 1 },
          queryRunner,
        });
        await expect(role).toBeNull();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('should retrieve an entity', async () => {
      const subject = testRoles[0];
      const queryRunner =
        await roleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const role = await roleRepository.getOne({
          where: { id: subject.id },
          queryRunner,
        });

        expect(role).toBeDefined();
        expect(role.id).toEqual(subject.id);
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
        await roleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const role = await roleRepository.insertOne({
          entity: subject,
          queryRunner,
        });

        expect(role).toBeDefined();
        expect(role.name).toEqual(subject.name);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('delete()', () => {
    it('should delete the first entity in seed', async () => {
      const subjectRole = testRoles[0];

      const queryRunner =
        await roleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const role = await roleRepository.getOne({
          where: { id: subjectRole.id },
          queryRunner,
        });

        expect(role).toBeDefined();

        await roleRepository.deleteOne({
          id: role.id,
          queryRunner,
        });

        const shop = await roleRepository.getOne({
          where: { id: subjectRole.id },
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
        await roleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const roles = await roleRepository.getMany({
          queryRunner,
        });

        expect(roles.length).toEqual(testRoles.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('retrieves 2 when limits to 2', async () => {
      const queryRunner =
        await roleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await roleRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testRoles.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('getManyWithCount()', () => {
    it('returns all when retrieving all and count is correct', async () => {
      const queryRunner =
        await roleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await roleRepository.getManyWithCount({
          queryRunner,
        });

        expect(entities.length).toEqual(testRoles.length);
        expect(count).toEqual(testRoles.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('get all entities with limit and correct amount', async () => {
      const queryRunner =
        await roleRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await roleRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testRoles.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });
});
