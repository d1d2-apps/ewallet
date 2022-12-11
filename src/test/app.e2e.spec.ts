import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '@src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    api = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('root', () => {
    it('should return welcome message', () => {
      return api.get('/').expect(200).expect({ message: 'Welcome to the eWallet API' });
    });
  });
});
