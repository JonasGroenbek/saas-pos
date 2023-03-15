import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './organization.entity';
import { OrganizationService } from './organization.service';
import testTypeormConfig from '../postgres/typeorm-test.config';
import {
  clearTestData,
  restartSequences,
  seedTestData,
} from '../postgres/seeds/test-data.seed';
import { OrganizationRepository } from './organization.repository';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { AuthModule } from '../auth/auth.module';

describe('organization.service.ts', () => {
  let organizationService: OrganizationService;
  let testOrganizations: Organization[] = [];
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        AuthModule,
        TypeOrmModule.forRoot(testTypeormConfig),
        TypeOrmModule.forFeature([Organization]),
        UserModule,
        RoleModule,
      ],
      providers: [OrganizationService, OrganizationRepository],
    }).compile();

    organizationService = app.get<OrganizationService>(OrganizationService);

    const queryRunner =
      organizationService.organizationRepository.manager.connection.createQueryRunner();
    const testData = await seedTestData(queryRunner);
    testOrganizations = testData.organizations;
    await queryRunner.release();
  });

  afterAll(async () => {
    const queryRunner =
      organizationService.organizationRepository.manager.connection.createQueryRunner();
    await clearTestData(queryRunner);
    await restartSequences(queryRunner);
    await queryRunner.release();
    await app.close();
  });

  it('OrganizationService is defined"', () => {
    expect(organizationService).toBeDefined();
  });

  describe('registerOrganization()', () => {
    it('should create an organization', async () => {
      const dto: RegisterOrganizationDto = {
        organizationName: 'test_org',
        email: 'test@mail.com',
        firstName: 'test_first_name',
        lastName: 'test_last_name',
        password: 'test_password',
        confirmationPassword: 'test_password',
      };
      const organization = await organizationService.registerOrganization(dto);

      expect(organization).toBeDefined();
    });
  });
});
