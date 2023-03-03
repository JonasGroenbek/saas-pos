import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { UserRepository } from './user.repository';
import {
  clearTestData,
  restartSequences,
  seedTestData,
} from '../postgres/seeds/test-data.seed';

describe('user.repository.ts', () => {
  let userRepository: UserRepository;
  let testUsers: User[] = [];
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeormConfig),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UserRepository],
    }).compile();

    userRepository = await app.get<UserRepository>(UserRepository);

    const queryRunner = userRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    testUsers = testData.users;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner = userRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('UserRepository is defined"', () => {
    expect(userRepository).toBeDefined();
  });

  describe('getOne()', () => {
    it('should throw error when attempting to retrieve not', async () => {
      const queryRunner =
        await userRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const largestId = testUsers.reduce((acc, cur) => {
          return acc < cur.id ? cur.id : acc;
        }, 0);

        const user = await userRepository.getOne({
          where: { id: largestId + 1, organizationId: 1 },
          queryRunner,
        });
        await expect(user).toBeNull();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('should retrieve an entity', async () => {
      const subject = testUsers[0];
      const queryRunner =
        await userRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const user = await userRepository.getOne({
          where: { id: subject.id, organizationId: 1 },
          queryRunner,
        });

        expect(user).toBeDefined();
        expect(user.id).toEqual(subject.id);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('create()', () => {
    it('should create an entity', async () => {
      const subject: Partial<User> = {
        firstName: 'test_user_1',
        lastName: 'test_user_1',
        email: 'test_someone1@email.com',
        password: 'password1',
        organizationId: 1,
        roleId: 1,
      };
      const queryRunner =
        await userRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const user = await userRepository.insertOne({
          entity: subject,
          queryRunner,
        });

        expect(user).toBeTruthy();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('delete()', () => {
    it('should delete the first entity in seed', async () => {
      const subjectUser = testUsers[0];

      const queryRunner =
        await userRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const user = await userRepository.getOne({
          where: { id: subjectUser.id, organizationId: 1 },
          queryRunner,
        });

        expect(user).toBeDefined();

        await userRepository.deleteOne({
          id: user.id,
          organizationId: 1,
          queryRunner,
        });

        const shop = await userRepository.getOne({
          where: { id: subjectUser.id, organizationId: 1 },
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
        await userRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const users = await userRepository.getMany({
          queryRunner,
        });

        expect(users.length).toEqual(testUsers.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('retrieves 2 when limits to 2', async () => {
      const queryRunner =
        await userRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await userRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testUsers.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });

  describe('getManyWithCount()', () => {
    it('returns all when retrieving all and count is correct', async () => {
      const queryRunner =
        await userRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await userRepository.getManyWithCount({
          queryRunner,
        });

        expect(entities.length).toEqual(testUsers.length);
        expect(count).toEqual(testUsers.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });

    it('get all entities with limit and correct amount', async () => {
      const queryRunner =
        await userRepository.manager.connection.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        const { entities, count } = await userRepository.getManyWithCount({
          limit: 2,
          queryRunner,
        });
        expect(entities.length).toEqual(2);
        expect(count).toEqual(testUsers.length);
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });
});
