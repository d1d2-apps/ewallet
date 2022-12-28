import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import request from 'supertest';

import { AppModule } from '@src/app.module';
import { AuthService, IAuthResponse } from '@src/modules/auth/auth.service';
import { mockRandomPassword, mockRandomEmail, mockRandomName, mockRandomInvalidToken, mockRandomUuid } from '@src/utils/tests/mocks.fn';

import { CreditCardsService } from '../credit-cards.service';
import { CreditCardModel } from '../models/credit-card.model';
import { mockCreateCreditCardNoDataResponse } from './mocks/credit-cards-responses.mock';

describe('CreditCardsController (e2e)', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;

  let authService: AuthService;
  let creditCardsService: CreditCardsService;

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
    creditCardsService = module.get<CreditCardsService>(CreditCardsService);

    const password = mockRandomPassword();
    userAuth = await authService.register({
      email: mockRandomEmail(),
      name: mockRandomName(),
      password,
      passwordConfirmation: password,
    });
  });

  describe("get user's credit cards list", () => {
    it('should not get unauthenticated user credit cards authenticated user', async () => {
      const response = await api.get('/users/credit-cards').expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should not get user credit cards list with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.get('/users/credit-cards').set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it('should get user credit cards list', async () => {
      let response = await api.get('/users/credit-cards').set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body).toStrictEqual([]);

      const firstCreditCard = await creditCardsService.create(userAuth.user.id, { name: mockRandomName() });

      const secondCreditCard = await creditCardsService.create(userAuth.user.id, { name: mockRandomName() });

      response = await api.get('/users/credit-cards').set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body.length).toStrictEqual(2);
      expect(response.body[0].name).toStrictEqual(firstCreditCard.name);
      expect(response.body[1].name).toStrictEqual(secondCreditCard.name);
    });
  });

  describe('get credit cards by id', () => {
    let creditCard: CreditCardModel;

    beforeAll(async () => {
      creditCard = await creditCardsService.create(userAuth.user.id, { name: mockRandomName() });
    });

    it('should not get unauthenticatedt authenticated user', async () => {
      const response = await api.get(`/users/credit-cards/${creditCard.id}`).expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should not get credit card with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.get(`/users/credit-cards/${creditCard.id}`).set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it('should not get credit card with invalid ID', async () => {
      const invalidCreditCardId = mockRandomUuid();

      const response = await api.get(`/users/credit-cards/${invalidCreditCardId}`).set('authorization', `Bearer ${userAuth.token}`).expect(404);

      expect(response.body.message).toStrictEqual(`Credit card not found with id [${invalidCreditCardId}]`);
    });

    it('should get credit card by ID', async () => {
      const response = await api.get(`/users/credit-cards/${creditCard.id}`).set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body.id).toStrictEqual(creditCard.id);
      expect(response.body.name).toStrictEqual(creditCard.name);
    });
  });

  describe('create credit card', () => {
    it('should raise 400 for not authenticated user', async () => {
      const response = await api.post('/users/credit-cards').expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should raise 400 for invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.post('/users/credit-cards').set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it('should raise 400 for no data', async () => {
      const response = await api.post('/users/credit-cards').set('authorization', `Bearer ${userAuth.token}`).send(undefined).expect(400);

      expect(response.body.message).toStrictEqual(mockCreateCreditCardNoDataResponse);
    });

    it('should create credit card', async () => {
      const data = {
        name: mockRandomName(),
      };

      const response = await api.post('/users/credit-cards').set('authorization', `Bearer ${userAuth.token}`).send(data).expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.name).toStrictEqual(data.name);
    });
  });

  describe('update credit card', () => {
    let creditCard: CreditCardModel;

    beforeAll(async () => {
      creditCard = await creditCardsService.create(userAuth.user.id, { name: mockRandomName() });
    });

    it('should raise 400 for not authenticated user', async () => {
      const response = await api.put(`/users/credit-cards/${creditCard.id}`).expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should raise 400 for invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.put(`/users/credit-cards/${creditCard.id}`).set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it('should raise 400 for invalid credit card id', async () => {
      const invalidCreditCardId = mockRandomUuid();

      const data = {
        name: mockRandomName(),
      };

      const response = await api
        .put(`/users/credit-cards/${invalidCreditCardId}`)
        .set('authorization', `Bearer ${userAuth.token}`)
        .send(data)
        .expect(404);

      expect(response.body.message).toStrictEqual(`Credit card not found with id [${invalidCreditCardId}]`);
    });

    it('should update credit card', async () => {
      const data = {
        name: mockRandomName(),
      };

      const response = await api.put(`/users/credit-cards/${creditCard.id}`).set('authorization', `Bearer ${userAuth.token}`).send(data).expect(200);

      expect(response.body.id).toStrictEqual(creditCard.id);
      expect(response.body.name).toStrictEqual(data.name);
    });
  });

  describe('delete credit card', () => {
    let creditCard: CreditCardModel;

    beforeAll(async () => {
      creditCard = await creditCardsService.create(userAuth.user.id, { name: mockRandomName() });
    });

    it('should raise 400 for not authenticated user', async () => {
      const response = await api.delete(`/users/credit-cards/${creditCard.id}`).expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should raise 400 for invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.delete(`/users/credit-cards/${creditCard.id}`).set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it('should raise 400 for invalid credit card id', async () => {
      const invalidCreditCardId = mockRandomUuid();

      const response = await api.delete(`/users/credit-cards/${invalidCreditCardId}`).set('authorization', `Bearer ${userAuth.token}`).expect(404);

      expect(response.body.message).toStrictEqual(`Credit card not found with id [${invalidCreditCardId}]`);
    });

    it('should delete credit card', async () => {
      await api.delete(`/users/credit-cards/${creditCard.id}`).set('authorization', `Bearer ${userAuth.token}`).expect(200);

      const deletedCreditCard = await creditCardsService.findById(creditCard.id).catch((error) => {
        expect(error.message).toStrictEqual(`Credit card not found with id [${creditCard.id}]`);
      });

      expect(deletedCreditCard).not.toBeDefined();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
