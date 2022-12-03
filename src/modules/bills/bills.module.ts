import { Module } from '@nestjs/common';
import { UsersService } from '@src/modules/users/users.service';
import { BCryptHashProvider } from '@src/shared/providers/hash/bcrypt-hash.provider';
import { FirebaseStorageProvider } from '@src/shared/providers/storage/firebase-storage.provider';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { PrismaService } from '@src/shared/database/prisma.service';
import { CreditCardsService } from '../users/modules/credit-cards/credit-cards.service';
import { DebtorsService } from '../users/modules/debtors/debtors.service';

@Module({
  providers: [BillsService, PrismaService, CreditCardsService, DebtorsService, UsersService, FirebaseStorageProvider, BCryptHashProvider],
  controllers: [BillsController],
})
export class BillsModule {}
