import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { PrismaService } from '@src/shared/database/prisma.service';
import { DebtorsController } from './modules/debtors/debtors.controller';
import { DebtorsService } from './modules/debtors/debtors.service';
import { CreditCardsService } from './modules/credit-cards/credit-cards.service';
import { CreditCardsController } from './modules/credit-cards/credit-cards.controller';
import { hashServiceProvider } from '@src/shared/providers/hash';
import { storageServiceProvider } from '@src/shared/providers/storage';

@Module({
  providers: [UsersService, PrismaService, hashServiceProvider, storageServiceProvider, DebtorsService, CreditCardsService],
  controllers: [UsersController, DebtorsController, CreditCardsController],
})
export class UsersModule {}
