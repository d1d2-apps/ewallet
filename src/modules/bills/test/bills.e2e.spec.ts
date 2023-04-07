import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';

import request from 'supertest';

import { AppModule } from '@src/app.module';
import { AuthService, IAuthResponse } from '@src/modules/auth/auth.service';
import { CreditCardsService } from '@src/modules/users/modules/credit-cards/credit-cards.service';
import { CreditCardModel } from '@src/modules/users/modules/credit-cards/models/credit-card.model';
import { DebtorsService } from '@src/modules/users/modules/debtors/debtors.service';
import { DebtorModel } from '@src/modules/users/modules/debtors/models/debtor.model';
import { PrismaService } from '@src/shared/database/prisma.service';
import {
  mockRandomPassword,
  mockRandomEmail,
  mockRandomName,
  mockRandomInvalidToken,
  mockRandomString,
  mockRandomUuid,
} from '@src/utils/tests/mocks.fn';

import { BillsService } from '../bills.service';
import { BillDto } from '../dtos/create-bill.dto';
import { BillCategory, BillModel } from '../models/bill.model';
import { mockCreateBillNoDataResponse, mockFindBillsInvalidQueryFormat, mockUpdateBillNoDataResponse } from './mocks/bills-responses.mock';

describe('BillsController (e2e)', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;

  let prisma: PrismaService;
  let authService: AuthService;
  let debtorsService: DebtorsService;
  let creditCardsService: CreditCardsService;
  let billsService: BillsService;

  let userAuth: IAuthResponse;
  let anotherUserAuth: IAuthResponse;
  let userPassword: string;
  let creditCard: CreditCardModel;
  let debtor: DebtorModel;
  let anotherUserDebtor: DebtorModel;
  let baseBill: BillDto;
  let bill: BillModel;
  let anotherUserBill: BillModel;

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
    billsService = module.get<BillsService>(BillsService);
    debtorsService = module.get<DebtorsService>(DebtorsService);
    creditCardsService = module.get<CreditCardsService>(CreditCardsService);

    userPassword = mockRandomPassword();

    userAuth = await authService.register({
      email: mockRandomEmail(),
      name: mockRandomName(),
      password: userPassword,
      passwordConfirmation: userPassword,
    });

    anotherUserAuth = await authService.register({
      email: mockRandomEmail(),
      name: mockRandomName(),
      password: userPassword,
      passwordConfirmation: userPassword,
    });

    creditCard = await creditCardsService.create(userAuth.user.id, { name: mockRandomName() });

    debtor = await debtorsService.create(userAuth.user.id, { color: '#ffffff', name: mockRandomName() });

    anotherUserDebtor = await debtorsService.create(anotherUserAuth.user.id, { color: '#ffffff', name: mockRandomName() });

    baseBill = {
      category: BillCategory.EDUCATION,
      creditCardId: creditCard.id,
      date: new Date().toISOString(),
      description: mockRandomString({ length: 64 }),
      installment: 0,
      totalOfInstallments: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      paid: false,
      totalAmount: 1000,
      billDebtors: [
        {
          amount: 500,
          debtorId: debtor.id,
          description: mockRandomString({ length: 64 }),
          paid: false,
        },
        {
          amount: 500,
          userId: userAuth.user.id,
          description: mockRandomString({ length: 64 }),
          paid: false,
        },
      ],
    };

    bill = (await billsService.create(userAuth.user.id, { bill: baseBill })) as BillModel;

    anotherUserBill = (await billsService.create(anotherUserAuth.user.id, {
      bill: {
        ...baseBill,
        billDebtors: [
          {
            amount: 500,
            debtorId: debtor.id,
            description: mockRandomString({ length: 64 }),
            paid: false,
          },
          {
            amount: 500,
            userId: anotherUserAuth.user.id,
            description: mockRandomString({ length: 64 }),
            paid: false,
          },
        ],
      },
    })) as BillModel;
  });

  describe('get all', () => {
    it('should not get all bills for unauthenticated user', async () => {
      const response = await api.get('/bills').expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should not get all bills with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.get('/bills').set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it('should raise 400 for invalid query format', async () => {
      const response = await api
        .get('/bills')
        .query({ year: 'year', month: 'month', creditCardId: 'not-uuid' })
        .set('authorization', `Bearer ${userAuth.token}`)
        .expect(400);

      expect(response.body.message).toStrictEqual(mockFindBillsInvalidQueryFormat);
    });

    it('should get all bills from logged user', async () => {
      const response = await api.get('/bills').set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body).toBeTruthy();
      expect(Array.isArray(response.body)).toEqual(true);
      expect(response.body[0].id).toStrictEqual(bill.id);
      expect(response.body[0].billDebtors.length).toStrictEqual(bill.billDebtors.length);
    });

    it('should get nothing for not existing credit card id', async () => {
      const response = await api.get('/bills').query({ creditCardId: mockRandomUuid() }).set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body.length).toEqual(0);
    });

    it('should get all bills from existing credit card', async () => {
      const response = await api.get('/bills').query({ creditCardId: creditCard.id }).set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body).toBeTruthy();
      expect(Array.isArray(response.body)).toEqual(true);
      expect(response.body.every((bill: BillModel) => bill.creditCardId === creditCard.id)).toEqual(true);
    });
  });

  describe('get by id', () => {
    it('should not get all bills for unauthenticated user', async () => {
      const response = await api.get(`/bills/${bill.id}`).expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should not get all bills with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.get(`/bills/${bill.id}`).set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it("should not get another user's bill data", async () => {
      const response = await api.get(`/bills/${anotherUserBill.id}`).set('authorization', `Bearer ${userAuth.token}`).expect(400);

      expect(response.body.message).toEqual("You can't access another user's bill");
    });

    it('should get bill data', async () => {
      const response = await api.get(`/bills/${bill.id}`).set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body.id).toBeTruthy();
    });
  });

  describe('create', () => {
    it('should not create bill for unauthenticated user', async () => {
      const response = await api.post('/bills').expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should not create bill with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.post('/bills').set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it('should raise 400 for incorrect data format', async () => {
      const response = await api.post('/bills').set('authorization', `Bearer ${userAuth.token}`).send({}).expect(400);

      expect(response.body.message).toStrictEqual('You need to send a bill object or a bills array');
    });

    it('should raise 400 for no data', async () => {
      const response = await api.post('/bills').set('authorization', `Bearer ${userAuth.token}`).send({ bill: {}, bills: {} }).expect(400);

      expect(response.body.message).toStrictEqual(mockCreateBillNoDataResponse);
    });

    it('should create a single bill', async () => {
      const data = { bill: baseBill };

      const response = await api.post('/bills').set('authorization', `Bearer ${userAuth.token}`).send(data).expect(201);

      expect(response.body.id).toBeTruthy();
      expect(response.body.category).toEqual(data.bill.category);
      expect(response.body.creditCardId).toEqual(data.bill.creditCardId);
      expect(response.body.billDebtors.length).toEqual(data.bill.billDebtors.length);
    });

    it('should create multiple bills', async () => {
      const data = { bills: [baseBill, baseBill, baseBill] };

      const response = await api.post('/bills').set('authorization', `Bearer ${userAuth.token}`).send(data).expect(201);

      expect(response.body.length).toEqual(data.bills.length);
    });
  });

  describe('delete', () => {
    let billToDelete: BillModel;
    beforeEach(async () => {
      billToDelete = (await billsService.create(userAuth.user.id, { bill: baseBill })) as BillModel;
    });

    it('should not delete bill for unauthenticated user', async () => {
      const response = await api.delete(`/bills/${billToDelete.id}`).expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should not delete bill with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.delete(`/bills/${billToDelete.id}`).set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it("should not delete another user's bill", async () => {
      const response = await api.delete(`/bills/${anotherUserBill.id}`).set('authorization', `Bearer ${userAuth.token}`).expect(400);

      expect(response.body.message).toEqual("You can't access another user's bill");
    });

    it('should delete bill', async () => {
      await api.delete(`/bills/${billToDelete.id}`).set('authorization', `Bearer ${userAuth.token}`).expect(200);

      const deletedBill = await billsService.findById(userAuth.user.id, billToDelete.id).catch((error) => {
        expect(error.message).toStrictEqual(`Bill not found with id [${billToDelete.id}]`);
      });

      expect(deletedBill).not.toBeDefined();
    });
  });

  describe('update', () => {
    it('should not update bill for unauthenticated user', async () => {
      const response = await api.put(`/bills/${bill.id}`).send({});

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should not update bill with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.put(`/bills/${bill.id}`).set('authorization', `Bearer ${invalidToken}`).send({}).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it("should not update another user's bill", async () => {
      const response = await api
        .put(`/bills/${anotherUserBill.id}`)
        .set('authorization', `Bearer ${userAuth.token}`)
        .send({ billDebtors: [] })
        .expect(400);

      expect(response.body.message).toEqual("You can't access another user's bill");
    });

    it("should not update another user's bill", async () => {
      const response = await api.put(`/bills/${bill.id}`).set('authorization', `Bearer ${userAuth.token}`).send({}).expect(400);

      expect(response.body.message).toStrictEqual(mockUpdateBillNoDataResponse);
    });

    it('should update bill data but not the bill debtors', async () => {
      const data = {
        category: BillCategory.TRAVEL,
        billDebtors: [],
      };

      const response = await api.put(`/bills/${bill.id}`).set('authorization', `Bearer ${userAuth.token}`).send(data).expect(200);

      expect(response.body.category).toEqual(BillCategory.TRAVEL);
      expect(response.body.billDebtors.length).toEqual(bill.billDebtors.length);
      expect(response.body.billDebtors.length).not.toEqual(data.billDebtors);
    });

    it('should update bill debtors', async () => {
      const data = {
        category: BillCategory.TRAVEL,
        totalAmount: 1500,
        billDebtors: [
          {
            id: bill.billDebtors[0].id,
            amount: 1500,
            userId: userAuth.user.id,
            description: mockRandomString({ length: 64 }),
            paid: false,
          },
        ],
      };

      const response = await api.put(`/bills/${bill.id}`).set('authorization', `Bearer ${userAuth.token}`).send(data).expect(200);

      expect(response.body.category).toEqual(BillCategory.TRAVEL);
      expect(response.body.totalAmount).toEqual(data.totalAmount);
      expect(response.body.billDebtors.length).toEqual(data.billDebtors.length);
      expect(response.body.billDebtors[0].amount).toEqual(data.billDebtors[0].amount);
    });
  });

  // TODO the following endpoint tests
  // @Patch(':id/paid')

  afterAll(async () => {
    await app.close();
  });
});
