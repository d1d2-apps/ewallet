import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import path from 'path';
import request from 'supertest';

import { AppModule } from '@src/app.module';
import { AuthService, IAuthResponse } from '@src/modules/auth/auth.service';
import { mockRandomEmail, mockRandomInvalidToken, mockRandomName, mockRandomPassword } from '@src/utils/tests/mocks.fn';

import { UsersService } from '../users.service';
import { mockChangePasswordNoDataResponse, mockUpdateProfileInvalidDataResponse } from './mocks/users-responses.mock';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;

  let authService: AuthService;
  let usersService: UsersService;

  let userAuth: IAuthResponse;
  let userPassword: string;

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
    usersService = module.get<UsersService>(UsersService);

    userPassword = mockRandomPassword();
    userAuth = await authService.register({
      email: mockRandomEmail(),
      name: mockRandomName(),
      password: userPassword,
      passwordConfirmation: userPassword,
    });
  });

  describe('get me', () => {
    it('should not get unauthenticated user information', async () => {
      const response = await api.get('/users/me').expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');
    });

    it('should not get user information with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.get('/users/me').set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');
    });

    it('should get logged user information', async () => {
      const response = await api.get('/users/me').set('authorization', `Bearer ${userAuth.token}`).expect(200);

      expect(response.body).not.toHaveProperty('password');
      expect(response.body.name).toStrictEqual(userAuth.user.name);
      expect(response.body.email).toStrictEqual(userAuth.user.email);
    });
  });

  describe('update profile', () => {
    it('should raise 400 for no data', async () => {
      const response = await api.put('/users/profile').set('authorization', `Bearer ${userAuth.token}`).send(undefined).expect(400);

      expect(response.body.message).toStrictEqual('There is no information to update');
    });

    it('should raise 400 for invalid data', async () => {
      const data = { email: 'invalid-email' };

      const response = await api.put('/users/profile').set('authorization', `Bearer ${userAuth.token}`).send(data).expect(400);

      expect(response.body.message).toStrictEqual(mockUpdateProfileInvalidDataResponse);
    });

    it('should raise 400 for already used e-mail address', async () => {
      const password = mockRandomPassword();
      const otherUser = await authService.register({
        email: mockRandomEmail(),
        name: mockRandomName(),
        password,
        passwordConfirmation: password,
      });

      const data = { email: otherUser.user.email };

      const response = await api.put('/users/profile').set('authorization', `Bearer ${userAuth.token}`).send(data).expect(400);

      expect(response.body.message).toStrictEqual(`The provided email [${data.email}] is already in use`);
    });

    it('should update user profile', async () => {
      const data = {
        email: userAuth.user.email,
        name: mockRandomName(),
      };

      const response = await api.put('/users/profile').set('authorization', `Bearer ${userAuth.token}`).send(data).expect(200);

      expect(response.body.name).toStrictEqual(data.name);
    });
  });

  describe('chance password', () => {
    it('should raise 400 for no data', async () => {
      const response = await api.patch('/users/account/password').set('authorization', `Bearer ${userAuth.token}`).send(undefined).expect(400);

      expect(response.body.message).toStrictEqual(mockChangePasswordNoDataResponse);
    });

    it('should raise 400 for not motching old password', async () => {
      const newPassword = mockRandomPassword();

      const data = {
        oldPassword: mockRandomPassword(),
        password: newPassword,
        passwordConfirmation: newPassword,
      };

      const response = await api.patch('/users/account/password').set('authorization', `Bearer ${userAuth.token}`).send(data).expect(400);

      expect(response.body.message).toStrictEqual('Old password does not match');
    });

    it('should raise 400 for not motching new password', async () => {
      const data = {
        oldPassword: userPassword,
        password: mockRandomPassword(),
        passwordConfirmation: mockRandomPassword(),
      };

      const response = await api.patch('/users/account/password').set('authorization', `Bearer ${userAuth.token}`).send(data).expect(400);

      expect(response.body.message).toStrictEqual('Password and password confirmation do not match');
    });

    it('should chance user password', async () => {
      const newPassword = mockRandomPassword();

      const data = {
        oldPassword: userPassword,
        password: newPassword,
        passwordConfirmation: newPassword,
      };

      await api.patch('/users/account/password').set('authorization', `Bearer ${userAuth.token}`).send(data).expect(200);
    });
  });

  describe('upload picture', () => {
    it('should not upload picture with empty file', async () => {
      const data = { file: undefined };

      const response = await api.patch('/users/profile/picture').set('authorization', `Bearer ${userAuth.token}`).send(data).expect(400);

      expect(response.body.message).toStrictEqual('File is missing');
    });

    it('should upload user profile picture', async () => {
      const filePath = path.join(__dirname, '..', '..', '..', 'assets', 'tests', 'picture.png');

      const response = await api
        .patch('/users/profile/picture')
        .set('Content-Type', 'multipart/form-data')
        .set('authorization', `Bearer ${userAuth.token}`)
        .attach('file', filePath)
        .expect(200);

      expect(response.body.picture).toStrictEqual(`${process.env.USERS_AVATARS_FOLDER}/${userAuth.user.id}`);
    });
  });

  describe('delete account', () => {
    it('should not delete account for unauthorized user', async () => {
      const response = await api.delete('/users/account').expect(401);

      expect(response.body.message).toStrictEqual('JWT token is missing');

      const user = await usersService.findById(userAuth.user.id);

      expect(user).toBeDefined();
      expect(user).toBeTruthy();
    });

    it('should not delete account with invalid JWT token', async () => {
      const invalidToken = mockRandomInvalidToken();

      const response = await api.delete('/users/account').set('authorization', `Bearer ${invalidToken}`).expect(401);

      expect(response.body.message).toStrictEqual('Invalid JWT token');

      const user = await usersService.findById(userAuth.user.id);

      expect(user).toBeDefined();
      expect(user).toBeTruthy();
    });

    it('should delete user account', async () => {
      await api.delete('/users/account').set('authorization', `Bearer ${userAuth.token}`).expect(200);

      const user = await usersService.findById(userAuth.user.id).catch((error) => {
        expect(error.message).toStrictEqual(`User not found with id [${userAuth.user.id}]`);
      });

      expect(user).not.toBeDefined();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
