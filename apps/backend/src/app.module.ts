import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { EnsureAuthenticatedMiddleware } from './modules/auth/middlewares/ensure-authenticated.middleware';
import { BillsController } from './modules/bills/bills.controller';
import { BillsModule } from './modules/bills/bills.module';
import { CreditCardsController } from './modules/users/modules/credit-cards/credit-cards.controller';
import { DebtorsController } from './modules/users/modules/debtors/debtors.controller';
import { UsersController } from './modules/users/users.controller';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [UsersModule, AuthModule, BillsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAuthenticatedMiddleware)
      .forRoutes(UsersController, DebtorsController, CreditCardsController, BillsController);
  }
}
