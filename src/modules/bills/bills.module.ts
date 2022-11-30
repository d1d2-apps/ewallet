import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { PrismaService } from '@src/shared/database/prisma.service';
import { CreditCardsService } from '../users/modules/credit-cards/credit-cards.service';
import { DebtorsService } from '../users/modules/debtors/debtors.service';

@Module({
  providers: [BillsService, PrismaService, CreditCardsService, DebtorsService],
  controllers: [BillsController],
})
export class BillsModule {}
