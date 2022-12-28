import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { subMinutes } from 'date-fns';
import request from 'supertest';

import { AppModule } from '@src/app.module';
import { AuthService } from '@src/modules/auth/auth.service';
import { UserModel } from '@src/modules/users/models/user.model';
import { UsersService } from '@src/modules/users/users.service';
import { PrismaService } from '@src/shared/database/prisma.service';
import { HashProvider } from '@src/shared/providers/hash/implementations/hash.provider';
import { mockRandomEmail, mockRandomName, mockRandomPassword, mockRandomUuid } from '@src/utils/tests/mocks.fn';

import { ResetPasswordTokenModel } from '../models/reset-password-token.model';
import {
  mockForgotPasswordErrorMessage,
  mockResetPasswordErrorMessage,
  mockSignInErrorMessage,
  mockSignUpErrorMessage,
} from './mocks/auth-responses.mock';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;

  let prisma: PrismaService;
  let usersService: UsersService;
  let authService: AuthService;
  let hashProvider: HashProvider;

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
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
    hashProvider = module.get<HashProvider>(HashProvider);
  });

  describe('sign in', () => {
    let user: UserModel;
    const password = mockRandomPassword();

    beforeAll(async () => {
      user = await usersService.create({
        email: mockRandomEmail(),
        name: mockRandomName(),
        password,
        passwordConfirmation: password,
      });
    });

    it('should raise 400 for no data', async () => {
      const response = await api.post('/auth/sign-in').send(undefined).expect(400);

      expect(response.body.message).toStrictEqual(mockSignInErrorMessage);
    });

    it('should raise 400 for wrong email address', async () => {
      const credentials = {
        email: 'non.existing.email@ewallet.com',
        password: mockRandomPassword(),
      };

      const response = await api.post('/auth/sign-in').send(credentials).expect(400);

      expect(response.body.message).toStrictEqual('Incorrect email/paswword combination');
    });

    it('should raise 400 for wrong password', async () => {
      const credentials = {
        email: user.email,
        password: mockRandomPassword(),
      };

      const response = await api.post('/auth/sign-in').send(credentials).expect(400);

      expect(response.body.message).toStrictEqual('Incorrect email/paswword combination');
    });

    it('should authenticate user', async () => {
      const credentials = {
        email: user.email,
        password,
      };

      const response = await api.post('/auth/sign-in').send(credentials).expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('user.id');
      expect(response.body).not.toHaveProperty('user.password');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toStrictEqual(user.email);
    });
  });

  describe('sign up', () => {
    let existingUser: UserModel;

    beforeAll(async () => {
      const password = mockRandomPassword();

      existingUser = await usersService.create({
        email: mockRandomEmail(),
        name: mockRandomName(),
        password,
        passwordConfirmation: password,
      });
    });

    it('should raise 400 for no data', async () => {
      const response = await api.post('/auth/sign-up').send(undefined).expect(400);

      expect(response.body.message).toStrictEqual(mockSignUpErrorMessage);
    });

    it('should raise 400 for already used email address', async () => {
      const password = mockRandomPassword();

      const data = {
        email: existingUser.email,
        name: mockRandomEmail(),
        password,
        passwordConfirmation: password,
      };

      const response = await api.post('/auth/sign-up').send(data).expect(400);

      expect(response.body.message).toStrictEqual(`The provided email [${data.email}] is already in use`);
    });

    it('should raise 400 for password not matching', async () => {
      const data = {
        name: mockRandomName(),
        email: mockRandomEmail(),
        password: mockRandomPassword(),
        passwordConfirmation: mockRandomPassword(),
      };

      const response = await api.post('/auth/sign-up').send(data).expect(400);

      expect(response.body.message).toStrictEqual('Password and password confirmation do not match');
    });

    it('should register new user', async () => {
      const password = mockRandomPassword();

      const data = {
        name: mockRandomName(),
        email: mockRandomEmail(),
        password,
        passwordConfirmation: password,
      };

      const response = await api.post('/auth/sign-up').send(data).expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('user.id');
      expect(response.body).not.toHaveProperty('user.password');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.name).toStrictEqual(data.name);
      expect(response.body.user.email).toStrictEqual(data.email);
    });
  });

  describe('forgot-password', () => {
    let user: UserModel;

    beforeAll(async () => {
      const password = mockRandomPassword();

      user = await usersService.create({
        email: mockRandomEmail(),
        name: mockRandomName(),
        password,
        passwordConfirmation: password,
      });
    });

    it('should raise 400 for no data', async () => {
      const response = await api.post('/auth/forgot-password').send(undefined).expect(400);

      expect(response.body.message).toStrictEqual(mockForgotPasswordErrorMessage);
    });

    it('should raise 404 for wrong email address', async () => {
      const email = 'wrong.email@ewallet.com';

      const response = await api.post('/auth/forgot-password').send({ email }).expect(404);

      expect(response.body.message).toStrictEqual(`User not found with email [${email}]`);
    });

    it('should send password recovery email', async () => {
      await api.post('/auth/forgot-password').send({ email: user.email }).expect(201);
    });
  });

  describe('reset-password', () => {
    let user: UserModel;
    let userResetPasswordToken: ResetPasswordTokenModel;
    let userExpiredResetPasswordToken: ResetPasswordTokenModel;

    beforeAll(async () => {
      const password = mockRandomPassword();

      user = await usersService.create({
        email: mockRandomEmail(),
        name: mockRandomName(),
        password,
        passwordConfirmation: password,
      });

      userExpiredResetPasswordToken = await prisma.resetPasswordToken.create({
        data: {
          userId: user.id,
          active: true,
          expiresIn: subMinutes(new Date(), Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN) + 2).toISOString(),
        },
      });

      userResetPasswordToken = await authService.generateResetPasswordToken(user.id);
    });

    it('should raise 400 for no data', async () => {
      const response = await api.post('/auth/reset-password').send(undefined).expect(400);

      expect(response.body.message).toStrictEqual(mockResetPasswordErrorMessage);
    });

    it('should raise 400 for password not matching', async () => {
      const data = {
        token: userResetPasswordToken.id,
        password: mockRandomPassword(),
        passwordConfirmation: mockRandomPassword(),
      };

      const response = await api.post('/auth/reset-password').send(data).expect(400);

      expect(response.body.message).toStrictEqual('Password and password confirmation do not match');
    });

    it('should raise 400 for wrong reset token', async () => {
      const password = mockRandomPassword();

      const data = {
        token: mockRandomUuid(),
        password,
        passwordConfirmation: password,
      };

      const response = await api.post('/auth/reset-password').send(data).expect(400);

      expect(response.body.message).toStrictEqual('Invalid reset password token');
    });

    it('should raise 400 for expired reset token', async () => {
      const password = mockRandomPassword();

      const data = {
        token: userExpiredResetPasswordToken.id,
        password,
        passwordConfirmation: password,
      };

      const response = await api.post('/auth/reset-password').send(data).expect(400);

      expect(response.body.message).toStrictEqual('Reset password token is expired');
    });

    it("should reset user's password", async () => {
      const password = mockRandomPassword();

      const data = {
        token: userResetPasswordToken.id,
        password,
        passwordConfirmation: password,
      };

      await api.post('/auth/reset-password').send(data).expect(201);

      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });

      const passwordMatched = await hashProvider.compareHash(data.password, updatedUser.password);

      expect(passwordMatched).toStrictEqual(true);
    });
  });

  afterAll(async () => {
    // await prisma.resetPasswordToken.deleteMany();
    // await prisma.user.deleteMany();

    await app.close();
  });
});
