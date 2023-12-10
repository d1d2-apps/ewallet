import { Module } from '@nestjs/common';

import { PrismaService } from '@src/shared/database/prisma.service';
import { hashServiceProvider } from '@src/shared/providers/hash';
import { storageServiceProvider } from '@src/shared/providers/storage';

import { CreditCardsController } from './modules/credit-cards/credit-cards.controller';
import { CreditCardsService } from './modules/credit-cards/credit-cards.service';
import { DebtorsController } from './modules/debtors/debtors.controller';
import { DebtorsService } from './modules/debtors/debtors.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [
    UsersService,
    PrismaService,
    hashServiceProvider,
    storageServiceProvider,
    DebtorsService,
    CreditCardsService,
  ],
  controllers: [UsersController, DebtorsController, CreditCardsController],
})
export class UsersModule {}
