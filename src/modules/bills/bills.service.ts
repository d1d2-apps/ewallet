import { BadRequestException, Injectable } from '@nestjs/common';

import { plainToClass, plainToInstance } from 'class-transformer';

import { PrismaService } from '@src/shared/database/prisma.service';

import { CreditCardsService } from '../users/modules/credit-cards/credit-cards.service';
import { DebtorsService } from '../users/modules/debtors/debtors.service';
import { BillDto, CreateBillDto } from './dtos/create-bill.dto';
import { BillDebtorModel } from './models/bill-debtor.model';
import { BillModel } from './models/bill.model';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService, private creditCards: CreditCardsService, private debtors: DebtorsService) {}

  public async create(userId: string, data: CreateBillDto): Promise<BillModel | BillModel[]> {
    if (!data.bill && !data.bills?.length) {
      throw new BadRequestException('You need to send a bill object or a bills array');
    }

    if (data.bill) {
      return this.createBill(userId, data.bill);
    }

    if (data.bills?.length) {
      const createBillsPromises = data.bills.map((billDto) => this.createBill(userId, billDto));
      return Promise.all(createBillsPromises);
    }
  }

  private async createBill(userId: string, data: BillDto): Promise<BillModel> {
    await this.creditCards.findById(data.creditCardId);

    const billDebtorsData = data.billDebtors;

    const debtorsUsersIds = billDebtorsData.filter((debtor) => debtor.userId).map((debtor) => debtor.userId);
    if (debtorsUsersIds.some((id) => id !== userId)) {
      throw new BadRequestException("You can't register a bill for another user");
    }

    const billDebtorsIds = billDebtorsData.filter((debtor) => debtor.debtorId).map((debtor) => debtor.debtorId);

    const checkIfDebtorsExistPromises = billDebtorsIds.map((id) => this.debtors.findById(id));
    await Promise.all(checkIfDebtorsExistPromises);

    const createdBill = await this.prisma.bill.create({
      data: {
        creditCardId: data.creditCardId,
        userId,
        month: data.month,
        year: data.year,
        date: data.date,
        totalAmount: data.totalAmount,
        installment: data.installment,
        totalOfInstallments: data.totalOfInstallments,
        description: data.description,
        paid: data.paid,
        category: data.category,
      },
    });

    const createBillDebtorsPromises = billDebtorsData.map((debtor) =>
      this.prisma.billDebtor.create({
        data: {
          billId: createdBill.id,
          userId,
          debtorId: debtor.debtorId,
          amount: debtor.amount,
          description: debtor.description,
          paid: debtor.paid,
        },
      }),
    );

    const createdBillDebtors = await Promise.all(createBillDebtorsPromises);

    const bill = plainToClass(BillModel, createdBill);
    bill.billDebtors = plainToInstance(BillDebtorModel, createdBillDebtors);

    return bill;
  }
}
