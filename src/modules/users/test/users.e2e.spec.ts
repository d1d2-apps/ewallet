import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Chance } from 'chance';

import { AppModule } from '@src/app.module';

import { PrismaService } from '@src/shared/database/prisma.service';
import { AuthService, IAuthResponse } from '@src/modules/auth/auth.service';

const chance = new Chance();

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;

  let prisma: PrismaService;
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

    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);

    userAuth = await authService.register({
      email: chance.email(),
      name: chance.name(),
      password: 'user-password',
      passwordConfirmation: 'user-password',
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
    await prisma.user.deleteMany();

    await app.close();
  });
});
