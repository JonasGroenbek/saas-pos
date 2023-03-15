import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtGuard } from '../guards/jwt.guard';
import { CommonModule } from 'src/common/common.module';

describe('auth.service.ts', () => {
  let authService: AuthService;
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        CommonModule,
        TypeOrmModule.forRoot(testTypeormConfig),
        UserModule,
      ],
      providers: [AuthService, JwtGuard],
    }).compile();

    authService = app.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('AuthService is defined"', () => {
    expect(authService).toBeDefined();
  });
});
