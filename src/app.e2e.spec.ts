import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from './app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('root', () => {
    it('should return welcome message', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect({ message: 'Welcome to the eWallet API' });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
