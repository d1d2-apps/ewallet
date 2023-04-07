import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { plainToClass, plainToInstance } from 'class-transformer';

import { PrismaService } from '@src/shared/database/prisma.service';

import { CreditCardsService } from '../users/modules/credit-cards/credit-cards.service';
import { DebtorsService } from '../users/modules/debtors/debtors.service';
import { BillDto, CreateBillDto } from './dtos/create-bill.dto';
import { FindBillsQueryDto } from './dtos/find-bills-query.dto';
import { UpdateBillDebtorDto } from './dtos/update-bill-debtor.dto';
import { UpdateBillDto } from './dtos/update-bill-dto';
import { UpdateBillPaidStatusDto } from './dtos/update-paid-status-bill.dto';
import { BillDebtorModel } from './models/bill-debtor.model';
import { BillModel } from './models/bill.model';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService, private creditCards: CreditCardsService, private debtors: DebtorsService) {}

  public async findById(userId: string, id: string): Promise<BillModel> {
    const bill = await this.prisma.bill.findUnique({ where: { id }, include: { billDebtors: true, creditCard: true } });

    if (!bill) {
      throw new NotFoundException(`Bill not found with id [${id}]`);
    }

    if (bill.userId !== userId) {
      throw new BadRequestException("You can't access another user's bill");
    }

    return plainToClass(BillModel, bill);
  }

  public async findAll(userId: string, { creditCardId, month, year }: FindBillsQueryDto): Promise<BillModel[]> {
    const bills = await this.prisma.bill.findMany({
      where: { userId, creditCardId, year, month },
      include: { billDebtors: true, creditCard: true },
      orderBy: { date: 'desc' },
    });

    return plainToInstance(BillModel, bills);
  }

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

  public async update(userId: string, billId: string, data: UpdateBillDto): Promise<BillModel> {
    const bill = await this.findById(userId, billId);

    if (bill.userId !== userId) {
      throw new BadRequestException("You can't update another user's bill");
    }

    const dataToUpdate: Omit<UpdateBillDto, 'billDebtors'> = {
      category: data.category ?? bill.category,
      creditCardId: data.creditCardId ?? bill.creditCardId,
      date: data.date ?? bill.date.toISOString(),
      description: data.description,
      installment: data.installment,
      month: data.month ?? bill.month,
      year: data.year ?? bill.year,
      paid: data.paid ?? bill.paid,
      totalAmount: data.totalAmount ?? bill.totalAmount,
      totalOfInstallments: data.totalOfInstallments ?? bill.totalOfInstallments,
    };

    const updatedBill = await this.prisma.bill.update({ where: { id: billId }, data: dataToUpdate });

    const billInstance = plainToClass(BillModel, updatedBill);

    if (data.billDebtors.length) {
      const updatedBillDebtors = await this.updateBillDebtors(bill, data.billDebtors);

      billInstance.billDebtors = plainToInstance(BillDebtorModel, updatedBillDebtors);
    } else {
      billInstance.billDebtors = plainToInstance(BillDebtorModel, bill.billDebtors);
    }

    return billInstance;
  }

  public async updatePaidStatus(userId: string, billId: string, data: UpdateBillPaidStatusDto): Promise<void> {
    const bill = await this.findById(userId, billId);

    if (bill.userId !== userId) {
      throw new BadRequestException("You can't update another user's bill");
    }

    await this.prisma.bill.update({ where: { id: bill.id }, data });
  }

  public async delete(userId: string, billId: string): Promise<void> {
    const bill = await this.findById(userId, billId);

    if (bill.userId !== userId) {
      throw new BadRequestException("You can't delete another user's bill");
    }

    await this.prisma.bill.delete({ where: { id: bill.id } });
  }

  private async updateBillDebtors(bill: BillModel, billDebtorsToUpdate: UpdateBillDebtorDto[]): Promise<BillDebtorModel[]> {
    await this.prisma.billDebtor.deleteMany({ where: { billId: bill.id } });

    const updateBillDebtrsPromises = billDebtorsToUpdate.map((debtor) =>
      this.prisma.billDebtor.create({
        data: {
          billId: bill.id,
          userId: bill.userId,
          debtorId: debtor.debtorId,
          amount: debtor.amount,
          description: debtor.description,
          paid: debtor.paid,
        },
      }),
    );

    const updatedBillDebtors = await Promise.all(updateBillDebtrsPromises);

    return updatedBillDebtors;
  }

  private async createBill(userId: string, data: BillDto): Promise<BillModel> {
    await this.creditCards.findById(data.creditCardId);

    const billDebtorsData = data.billDebtors;

    const debtorsUsersIds = billDebtorsData.filter((debtor) => debtor.userId).map((debtor) => debtor.userId);
    if (debtorsUsersIds.some((id) => id !== userId)) {
      throw new BadRequestException("You can't register another user's bill");
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
