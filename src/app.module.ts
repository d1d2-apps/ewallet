import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { UsersController } from './modules/users/users.controller';
import { DebtorsController } from './modules/users/modules/debtors/debtors.controller';
import { CreditCardsController } from './modules/users/modules/credit-cards/credit-cards.controller';

import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BillsModule } from './modules/bills/bills.module';

import { EnsureAuthenticatedMiddleware } from './modules/auth/middlewares/ensure-authenticated.middleware';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, AuthModule, BillsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EnsureAuthenticatedMiddleware).forRoutes(UsersController, DebtorsController, CreditCardsController);
  }
}
