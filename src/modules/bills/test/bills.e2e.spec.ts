import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';

import request from 'supertest';

import { AppModule } from '@src/app.module';
import { AuthService, IAuthResponse } from '@src/modules/auth/auth.service';
import { CreditCardsService } from '@src/modules/users/modules/credit-cards/credit-cards.service';
import { DebtorsService } from '@src/modules/users/modules/debtors/debtors.service';
import { PrismaService } from '@src/shared/database/prisma.service';
import { mockRandomPassword, mockRandomEmail, mockRandomName, mockRandomInvalidToken, mockRandomString } from '@src/utils/tests/mocks.fn';

import { BillsService } from '../bills.service';
import { BillCategory, BillModel } from '../models/bill.model';

describe('BillsController (e2e)', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;

  let prisma: PrismaService;
  let authService: AuthService;
  let debtorsService: DebtorsService;
  let creditCardsService: CreditCardsService;
  let billsService: BillsService;

  let userAuth: IAuthResponse;
  let userPassword: string;
  let bill: BillModel;

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

    const creditCard = await creditCardsService.create(userAuth.user.id, { name: mockRandomName() });

    const debtor = await debtorsService.create(userAuth.user.id, { color: '#ffffff', name: mockRandomName() });

    bill = (await billsService.create(userAuth.user.id, {
      bill: {
        category: BillCategory.EDUCATION,
        creditCardId: creditCard.id,
        date: new Date().toISOString(),
        description: mockRandomString({ length: 64 }),
        installment: null,
        totalOfInstallments: null,
        month: new Date().getMonth(),
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

    it('should get all bills from logged user', async () => {
      const response = await api.get('/bills').set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body).toBeTruthy();
      expect(Array.isArray(response.body)).toEqual(true);
      expect(response.body[0].id).toStrictEqual(bill.id);
      expect(response.body[0].billDebtors.length).toStrictEqual(bill.billDebtors.length);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
