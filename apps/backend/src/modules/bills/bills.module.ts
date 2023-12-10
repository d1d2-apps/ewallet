import { Module } from '@nestjs/common';

import { UsersService } from '@src/modules/users/users.service';
import { PrismaService } from '@src/shared/database/prisma.service';
import { hashServiceProvider } from '@src/shared/providers/hash';
import { storageServiceProvider } from '@src/shared/providers/storage';

import { CreditCardsService } from '../users/modules/credit-cards/credit-cards.service';
import { DebtorsService } from '../users/modules/debtors/debtors.service';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';

@Module({
  providers: [
    BillsService,
    PrismaService,
    CreditCardsService,
    DebtorsService,
    UsersService,
    storageServiceProvider,
    hashServiceProvider,
  ],
  controllers: [BillsController],
})
export class BillsModule {}
