import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { UserRepository } from './user.repository';
import {
  clearTestData,
  restartSequences,
  seedTestData,
  testTransaction,
  TEST_IDENTITIES,
} from '../postgres/seeds/test-data.seed';
import { QueryRunner } from 'typeorm';
import { HttpException } from '@nestjs/common';
import moment from 'moment';

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
    it('should return null when attempting to retrieve a user with a id that does not exist', async () => {
      const nonExistingId =
        testUsers.reduce((acc, cur) => {
          return acc < cur.id ? cur.id : acc;
        }, 0) + 1;

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const user = await userRepository.getOne({
            where: { id: nonExistingId },
            identity: null,
            queryRunner,
          });

          await expect(user).toBeNull();
        },
      );
    });

    it('should return null when attempting to retrieve a user through an identity from another organization', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const otherOrgIdentity = TEST_IDENTITIES.org2user3;

      const otherOrgUser = testUsers.find(
        (u) => u.organizationId === otherOrgIdentity.organizationId,
      );

      testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const user = await userRepository.getOne({
            where: { id: otherOrgUser.id },
            identity: identity,
            queryRunner,
          });

          expect(user).toBeNull();
        },
      );
    });

    it('should a user when the identity organization id matches the user retrieved', async () => {
      const identity = TEST_IDENTITIES.org1user1;

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const user = await userRepository.getOne({
            where: { id: identity.userId },
            identity: identity,
            queryRunner,
          });

          expect(user).toBeTruthy();
        },
      );
    });
  });

  describe('updateOne()', () => {
    it('should be able to update the email of a user with an organization matching the one in the provided identity', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const subjectUser = testUsers.find(
        (u) => u.organizationId === identity.organizationId,
      );
      const newEmail = 'new@email.com';

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const user = await userRepository.getOne({
            where: { id: subjectUser.id },
            identity: identity,
            queryRunner,
          });

          const updatedUser = await userRepository.updateOne({
            id: subjectUser.id,
            values: { email: newEmail },
            identity: identity,
            queryRunner,
          });

          expect(user.email).not.toEqual(updatedUser.email);

          expect(updatedUser.email).toEqual(newEmail);
        },
      );
    });

    it('it should throw an error when attempting to update the email of a user with an organization not matching the one of the provided identity', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const subjectUser = testUsers.find(
        (u) => u.organizationId !== identity.organizationId,
      );
      const newEmail = 'new@email.com';

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          await expect(
            userRepository.updateOne({
              id: subjectUser.id,
              values: { email: newEmail },
              identity: identity,
              queryRunner,
            }),
          ).rejects.toThrowError(HttpException);
        },
      );
    });

    it('it should update a user, even though providing identical properties ', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const subjectUser = testUsers.find(
        (u) => u.organizationId === identity.organizationId,
      );

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const user = await userRepository.getOne({
            where: { id: subjectUser.id },
            identity: identity,
            queryRunner,
          });

          const updatedUser = await userRepository.updateOne({
            id: subjectUser.id,
            values: { email: user.email },
            identity: identity,
            queryRunner,
          });

          expect(user.email).toEqual(updatedUser.email);
        },
      );
    });

    it('when updating a user, the updatedAt property should be updated as well', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const subjectUser = testUsers.find(
        (u) => u.organizationId === identity.organizationId,
      );

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const user = await userRepository.getOne({
            where: { id: subjectUser.id },
            identity: identity,
            queryRunner,
          });

          const updatedUser = await userRepository.updateOne({
            id: subjectUser.id,
            values: { email: user.email },
            identity: identity,
            queryRunner,
          });

          expect(moment(updatedUser.updatedAt).unix()).toBeGreaterThan(
            moment(user.updatedAt).unix(),
          );
        },
      );
    });
  });

  describe('insertOne()', () => {
    it('should throw an exception if attempting to create user with another organizationId than the provided identity', async () => {
      const identity = TEST_IDENTITIES.org1user1;

      const subjectUser: Partial<User> = {
        firstName: 'test_user_1',
        lastName: 'test_user_1',
        email: 'test_someone1@email.com',
        password: 'password1',
        organizationId: identity.organizationId + 1,
        roleId: 1,
      };

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          await expect(
            userRepository.insertOne({
              entity: subjectUser,
              identity,
              queryRunner,
            }),
          ).rejects.toThrowError(HttpException);
        },
      );
    });

    it('should be able to create a user provided the correct organizationid', async () => {
      const identity = TEST_IDENTITIES.org1user1;

      const subjectUser: Partial<User> = {
        firstName: 'test_user_1',
        lastName: 'test_user_1',
        email: 'test_someone1@email.com',
        password: 'password1',
        organizationId: identity.organizationId,
        roleId: 1,
      };

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const user = await userRepository.insertOne({
            entity: subjectUser,
            identity,
            queryRunner,
          });

          expect(user).toBeTruthy();
          expect(user.email).toEqual(subjectUser.email);
        },
      );
    });
  });

  describe('deleteOne()', () => {
    it('should not be able to delete a entity from another organization than the provided identity', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const userFromAnotherOrganization = testUsers.find(
        (u) => u.organizationId !== identity.organizationId,
      );

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const user = await userRepository.getOne({
            where: { id: userFromAnotherOrganization.id },
            identity: null,
            queryRunner,
          });

          expect(user).toBeDefined();

          await expect(
            userRepository.deleteOne({
              id: user.id,
              identity,
              queryRunner,
            }),
          ).rejects.toThrowError(HttpException);
        },
      );
    });

    it('should be able to delete the user providing a identity with a matching organization', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const subjectUser = testUsers.find((u) => u.id === identity.userId);

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const user = await userRepository.getOne({
            where: { id: subjectUser.id },
            identity: identity,
            queryRunner,
          });

          expect(user).toBeDefined();

          await userRepository.deleteOne({
            id: user.id,
            identity: TEST_IDENTITIES.org1user1,
            queryRunner,
          });

          const deletedUser = await userRepository.getOne({
            where: { id: subjectUser.id },
            identity: identity,
            queryRunner,
          });

          await expect(deletedUser).toBeNull();
        },
      );
    });
  });

  describe('getMany()', () => {
    it('returns the total amount of users in an organization matching the one from the provided identity', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const expectedAmount = testUsers.filter(
        (u) => u.organizationId === identity.organizationId,
      ).length;

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const users = await userRepository.getMany({
            queryRunner,
            identity: identity,
          });

          expect(users.length).toEqual(expectedAmount);
        },
      );
    });

    it('retrieves 1 when limits to 1', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const expectedAmount = 1;

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const users = await userRepository.getMany({
            queryRunner,
            limit: 1,
            identity: identity,
          });

          expect(users.length).toEqual(expectedAmount);
        },
      );
    });

    it('should return the total amount of users across all organizations when not providing an identity', async () => {
      const expectedAmount = testUsers.length;

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const users = await userRepository.getMany({
            queryRunner,
            identity: null,
          });

          expect(users.length).toEqual(expectedAmount);
        },
      );
    });
  });

  describe('getManyWithCount()', () => {
    it('returns the total amount of users in an organization matching the one from the provided identity', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const expectedAmount = testUsers.filter(
        (u) => u.organizationId === identity.organizationId,
      ).length;

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const { entities, count } = await userRepository.getManyWithCount({
            queryRunner,
            identity: identity,
          });

          expect(entities.length).toEqual(count);
          expect(count).toEqual(expectedAmount);
        },
      );
    });

    it('retrieves 1 when limits to 1, while the count still returns total amount of users in the organization matching the provided identity', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const amountOfUsersInOrganization = testUsers.filter(
        (u) => u.organizationId === identity.organizationId,
      ).length;
      const expectedAmount = 1;

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const { entities, count } = await userRepository.getManyWithCount({
            queryRunner,
            limit: 1,
            identity: identity,
          });

          await expect(entities.length).toBeLessThan(count);
          await expect(entities.length).toEqual(expectedAmount);
          await expect(count).toEqual(amountOfUsersInOrganization);
        },
      );
    });

    it('should return the total amount of users across all organizations when not providing an identity', async () => {
      const expectedAmount = testUsers.length;

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const { entities, count } = await userRepository.getManyWithCount({
            queryRunner,
            identity: null,
          });

          expect(entities.length).toEqual(count);
          expect(count).toEqual(expectedAmount);
        },
      );
    });
  });

  describe('getCount()', () => {
    it('returns the total amount of users in an organization matching the one from the provided identity', async () => {
      const identity = TEST_IDENTITIES.org1user1;
      const expectedAmount = testUsers.filter(
        (u) => u.organizationId === identity.organizationId,
      ).length;

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const count = await userRepository.getCount({
            queryRunner,
            identity: identity,
          });

          expect(count).toEqual(expectedAmount);
        },
      );
    });

    it('should return the total amount of users across all organizations when not providing an identity', async () => {
      const expectedAmount = testUsers.length;

      await testTransaction(
        userRepository.manager.connection,
        async (queryRunner: QueryRunner) => {
          const count = await userRepository.getCount({
            queryRunner,
            identity: null,
          });

          expect(count).toEqual(expectedAmount);
        },
      );
    });
  });
});
