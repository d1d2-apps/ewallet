import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Chance } from 'chance';
import { subMinutes } from 'date-fns';

import {
  mockForgotPasswordErrorMessage,
  mockResetPasswordErrorMessage,
  mockSignInErrorMessage,
  mockSignUpErrorMessage,
} from './mocks/auth-responses.mock';

import { AppModule } from '@src/app.module';

import { UserModel } from '@src/modules/users/models/user.model';
import { ResetPasswordTokenModel } from '../models/reset-password-token.model';

import { UsersService } from '@src/modules/users/users.service';
import { AuthService } from '@src/modules/auth/auth.service';
import { PrismaService } from '@src/shared/database/prisma.service';
import { HashProvider } from '@src/shared/providers/hash/implementations/hash.provider';

const chance = new Chance();

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

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.resetPasswordToken.deleteMany();

    await app.close();
  });

  describe('sign in', () => {
    let user: UserModel;

    beforeAll(async () => {
      user = await usersService.create({
        email: 'user@ewallet.com',
        name: 'Fake eWallet User',
        password: '123456',
        passwordConfirmation: '123456',
      });
    });

    afterAll(async () => {
      await usersService.delete(user.id);
    });

    it('should raise 400 for no data', async () => {
      const response = await api.post('/auth/sign-in').send(undefined).expect(400);

      expect(response.body.message).toStrictEqual(mockSignInErrorMessage);
    });

    it('should raise 400 for wrong email address', async () => {
      const credentials = {
        email: 'non.existing.email@ewallet.com',
        password: 'fake-password',
      };

      const response = await api.post('/auth/sign-in').send(credentials).expect(400);

      expect(response.body.message).toStrictEqual('Incorrect email/paswword combination');
    });

    it('should raise 400 for wrong password', async () => {
      const credentials = {
        email: user.email,
        password: 'wrong-password',
      };

      const response = await api.post('/auth/sign-in').send(credentials).expect(400);

      expect(response.body.message).toStrictEqual('Incorrect email/paswword combination');
    });

    it('should authenticate user', async () => {
      const credentials = {
        email: user.email,
        password: '123456',
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
      existingUser = await usersService.create({
        email: 'used.email@ewallet.com',
        name: 'Fake User Name',
        password: '123456',
        passwordConfirmation: '123456',
      });
    });

    afterAll(async () => {
      await usersService.delete(existingUser.id);
    });

    it('should raise 400 for no data', async () => {
      const response = await api.post('/auth/sign-up').send(undefined).expect(400);

      expect(response.body.message).toStrictEqual(mockSignUpErrorMessage);
    });

    it('should raise 400 for already used email address', async () => {
      const data = {
        email: 'used.email@ewallet.com',
        name: 'Fake New User Name',
        password: 'new-user-password',
        passwordConfirmation: 'new-user-password',
      };

      const response = await api.post('/auth/sign-up').send(data).expect(400);

      expect(response.body.message).toStrictEqual(`The provided email [${data.email}] is already in use`);
    });

    it('should raise 400 for password not matching', async () => {
      const data = {
        name: chance.name(),
        email: chance.email(),
        password: chance.string({ length: 10 }),
        passwordConfirmation: chance.string({ length: 10 }),
      };

      const response = await api.post('/auth/sign-up').send(data).expect(400);

      expect(response.body.message).toStrictEqual('Password and password confirmation do not match');
    });

    it('should register new user', async () => {
      const newPassword = chance.string({ length: 10 });

      const data = {
        name: chance.name(),
        email: chance.email(),
        password: newPassword,
        passwordConfirmation: newPassword,
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
      user = await usersService.create({
        email: 'user@ewallet.com',
        name: 'Fake eWallet User',
        password: '123456',
        passwordConfirmation: '123456',
      });
    });

    afterAll(async () => {
      await usersService.delete(user.id);
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
      user = await usersService.create({
        email: 'user@ewallet.com',
        name: 'Fake eWallet User',
        password: '123456',
        passwordConfirmation: '123456',
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

    afterAll(async () => {
      await prisma.resetPasswordToken.deleteMany();
      await usersService.delete(user.id);
    });

    it('should raise 400 for no data', async () => {
      const response = await api.post('/auth/reset-password').send(undefined).expect(400);

      expect(response.body.message).toStrictEqual(mockResetPasswordErrorMessage);
    });

    it('should raise 400 for password not matching', async () => {
      const data = {
        token: userResetPasswordToken.id,
        password: 'new-password',
        passwordConfirmation: 'not-matching-password',
      };

      const response = await api.post('/auth/reset-password').send(data).expect(400);

      expect(response.body.message).toStrictEqual('Password and password confirmation do not match');
    });

    it('should raise 400 for wrong reset token', async () => {
      const data = {
        token: chance.guid(),
        password: 'new-password',
        passwordConfirmation: 'new-password',
      };

      const response = await api.post('/auth/reset-password').send(data).expect(400);

      expect(response.body.message).toStrictEqual('Invalid reset password token');
    });

    it('should raise 400 for expired reset token', async () => {
      const data = {
        token: userExpiredResetPasswordToken.id,
        password: 'new-password',
        passwordConfirmation: 'new-password',
      };

      const response = await api.post('/auth/reset-password').send(data).expect(400);

      expect(response.body.message).toStrictEqual('Reset password token is expired');
    });

    it("should reset user's password", async () => {
      const data = {
        token: userResetPasswordToken.id,
        password: 'new-password',
        passwordConfirmation: 'new-password',
      };

      await api.post('/auth/reset-password').send(data).expect(201);

      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });

      const passwordMatched = await hashProvider.compareHash(data.password, updatedUser.password);

      expect(passwordMatched).toStrictEqual(true);
    });
  });
});
