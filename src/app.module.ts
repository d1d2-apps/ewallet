import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { UsersController } from './modules/users/users.controller';
import { DebtorsController } from './modules/users/modules/debtors/debtors.controller';

import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

import { EnsureAuthenticatedMiddleware } from './modules/auth/middlewares/ensure-authenticated.middleware';
import { EnsureOwnUserMiddleware } from './modules/users/middlewares/ensure-own-user.middleware';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EnsureAuthenticatedMiddleware).forRoutes(UsersController, DebtorsController);

    consumer
      .apply(EnsureOwnUserMiddleware)
      .forRoutes(
        { method: RequestMethod.PUT, path: '/users/:id' },
        { method: RequestMethod.PATCH, path: '/users/:id/password' },
        { method: RequestMethod.DELETE, path: '/users/:id' },
      );
  }
}
