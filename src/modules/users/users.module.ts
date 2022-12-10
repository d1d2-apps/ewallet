import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { PrismaService } from '@src/shared/database/prisma.service';
import { BCryptHashProvider } from '@src/shared/providers/hash/bcrypt-hash.provider';
import { FirebaseStorageProvider } from '@src/shared/providers/storage/firebase-storage.provider';
import { DebtorsController } from './modules/debtors/debtors.controller';
import { DebtorsService } from './modules/debtors/debtors.service';
import { CreditCardsService } from './modules/credit-cards/credit-cards.service';
import { CreditCardsController } from './modules/credit-cards/credit-cards.controller';

@Module({
  providers: [UsersService, PrismaService, BCryptHashProvider, FirebaseStorageProvider, DebtorsService, CreditCardsService],
  controllers: [UsersController, DebtorsController, CreditCardsController],
})
export class UsersModule {}
