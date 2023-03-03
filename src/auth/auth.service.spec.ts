import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import testTypeormConfig from '../postgres/typeorm-test.config';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

describe('auth.service.ts', () => {
  let authService: AuthService;
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeormConfig),
        JwtModule,
        UserModule,
      ],
      providers: [AuthService],
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
