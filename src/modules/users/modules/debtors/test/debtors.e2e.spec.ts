import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '@src/app.module';

import { AuthService, IAuthResponse } from '@src/modules/auth/auth.service';

import { mockRandomEmail, mockRandomInvalidToken, mockRandomName, mockRandomPassword, mockRandomUuid } from '@src/utils/tests/mocks.fn';
import { DebtorsService } from '../debtors.service';
import { DebtorModel } from '../models/debtor.model';

describe('DebtorsController (e2e)', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;

  let authService: AuthService;
  let debtorsService: DebtorsService;

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
    debtorsService = module.get<DebtorsService>(DebtorsService);

    const password = mockRandomPassword();
    userAuth = await authService.register({
      email: mockRandomEmail(),
      name: mockRandomName(),
      password,
      passwordConfirmation: password,
    });
  });

  describe("get user's debtors list", () => {
    it('should not get unauthenticated user debtors list', async () => {
      const response = await api.get('/users/debtors').expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should not get user debtors list with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.get('/users/debtors').set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it('should get user debtors list', async () => {
      let response = await api.get('/users/debtors').set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body).toStrictEqual([]);

      const firstDebtor = await debtorsService.create(userAuth.user.id, {
        color: '#ffffff',
        name: mockRandomName(),
      });

      const secondDebtor = await debtorsService.create(userAuth.user.id, {
        color: '#ffffff',
        name: mockRandomName(),
      });

      response = await api.get('/users/debtors').set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body.length).toStrictEqual(2);
      expect(response.body[0].name).toStrictEqual(firstDebtor.name);
      expect(response.body[1].name).toStrictEqual(secondDebtor.name);
    });
  });

  describe('get debtors by id', () => {
    let debtor: DebtorModel;

    beforeAll(async () => {
      debtor = await debtorsService.create(userAuth.user.id, {
        color: '#ffffff',
        name: mockRandomName(),
      });
    });

    it('should not get unauthenticated debtor', async () => {
      const response = await api.get(`/users/debtors/${debtor.id}`).expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should not get debtor with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.get(`/users/debtors/${debtor.id}`).set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it('should not get debtor with invalid ID', async () => {
      const invalidDebtorId = mockRandomUuid();

      const response = await api.get(`/users/debtors/${invalidDebtorId}`).set('authorization', `Bearer ${userAuth.token}`).expect(400);

      expect(response.body.message).toStrictEqual(`Debtor not found with id [${invalidDebtorId}]`);
    });

    it('should get debtor by ID', async () => {
      const response = await api.get(`/users/debtors/${debtor.id}`).set('authorization', `Bearer ${userAuth.token}`).expect(400);

      expect(response.body.id).toStrictEqual(debtor.id);
      expect(response.body.color).toStrictEqual(debtor.color);
      expect(response.body.name).toStrictEqual(debtor.name);
    });
  });
});
