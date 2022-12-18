import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@src/app.module';

import { AuthService, IAuthResponse } from '@src/modules/auth/auth.service';

import { mockRandomEmail, mockRandomName, mockRandomPassword } from '@src/utils/tests/mocks.fn';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;

  let authService: AuthService;

  let userAuth: IAuthResponse;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    api = request(app.getHttpServer());

    authService = module.get<AuthService>(AuthService);

    const password = mockRandomPassword();
    userAuth = await authService.register({
      email: mockRandomEmail(),
      name: mockRandomName(),
      password,
      passwordConfirmation: password,
    });
  });

  describe('get me', () => {
    it('should get logged user information', async () => {
      const response = await api.get('/users/me').set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body).not.toHaveProperty('password');
      expect(response.body.name).toStrictEqual(userAuth.user.name);
      expect(response.body.email).toStrictEqual(userAuth.user.email);
    });
  });

  afterAll(async () => {
    // await prisma.user.deleteMany();

    await app.close();
  });
});
