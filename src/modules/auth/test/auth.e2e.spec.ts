import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Chance } from 'chance';

import { AppModule } from '@src/app.module';
import { mockSignInErrorMessage } from './mocks/auth-responses.mock';

const chance = new Chance();

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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
  });

  describe('sign up', () => {
    it('should raise 400 for no data', async () => {
      const data = {
        name: chance.name(),
        email: chance.email(),
        password: chance.string({ length: 10 }),
        passwordConfirmation: chance.string({ length: 10 }),
      };

      const response = await request(app.getHttpServer()).post('/auth/sign-up').send(data).expect(400);

      expect(response.body.message).toStrictEqual('Password and password confirmation do not match');
    });

    // TODO continue tests
  });

  describe('sign in', () => {
    it('should raise 400 for password not matching', async () => {
      const response = await request(app.getHttpServer()).post('/auth/sign-in').send(undefined).expect(400);

      expect(response.body.message).toStrictEqual(mockSignInErrorMessage);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
