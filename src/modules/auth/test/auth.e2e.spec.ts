import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Chance } from 'chance';

import { mockSignInErrorMessage, mockSignUpErrorMessage } from './mocks/auth-responses.mock';

import { AppModule } from '@src/app.module';

import { UserModel } from '@src/modules/users/models/user.model';

import { UsersService } from '@src/modules/users/users.service';
import { PrismaService } from '@src/shared/database/prisma.service';

const chance = new Chance();

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;

  let prisma: PrismaService;
  let usersService: UsersService;

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

    usersService = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();

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
});
