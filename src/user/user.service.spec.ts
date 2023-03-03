import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import testTypeormConfig from '../postgres/typeorm-test.config';
import {
  clearTestData,
  restartSequences,
  seedTestData,
} from '../postgres/seeds/test-data.seed';
import { UserModule } from '../user/user.module';
import { Organization } from '../organization/organization.entity';
import { User } from '../user/user.entity';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import { Role } from '../role/role.entity';
import { QueryRunner } from 'typeorm';

describe('organization.service.ts', () => {
  let userService: UserService;
  let organizations: Organization[] = [];
  let users: User[] = [];
  let roles: Role[] = [];
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(testTypeormConfig), UserModule],
      providers: [UserService, UserRepository],
    }).compile();

    userService = app.get<UserService>(UserService);
    const queryRunner =
      userService.userRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    users = testData.users;
    roles = testData.roles;
    organizations = testData.organizations;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner =
      userService.userRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('UserService is defined"', () => {
    expect(userService).toBeDefined();
  });

  describe('registerUser()', () => {
    it('should create a user', async () => {
      const dto: RegisterUserDto = {
        email: 'test@mail.com',
        firstName: 'test_first_name',
        lastName: 'test_last_name',
        password: 'test_password',
        confirmationPassword: 'test_password',
        organizationId: organizations[0].id,
        roleId: roles[0].id,
      };
      const user = await userService.registerUser(dto);
      expect(user).toBeDefined();
    });
  });
});
