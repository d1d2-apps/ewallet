import { Injectable, NotFoundException } from '@nestjs/common';

import { plainToClass, plainToInstance } from 'class-transformer';

import { PrismaService } from '@src/shared/database/prisma.service';

import { UsersService } from '../../users.service';
import { CreateDebtorDto } from './dtos/create-debtor.dto';
import { UpdateDebtorDto } from './dtos/update-debtor.dto';
import { DebtorModel } from './models/debtor.model';

@Injectable()
export class DebtorsService {
  constructor(private prisma: PrismaService, private users: UsersService) {}

  public async findById(id: string): Promise<DebtorModel> {
    const debtor = await this.prisma.debtor.findUnique({ where: { id } });

    if (!debtor) {
      throw new NotFoundException(`Debtor not found with id [${id}]`);
    }

    return plainToClass(DebtorModel, debtor);
  }

  public async findByUserId(userId: string): Promise<DebtorModel[]> {
    const user = await this.users.findById(userId);

    const debtors = await this.prisma.debtor.findMany({ where: { userId: user.id } });

    return plainToInstance(DebtorModel, debtors);
  }

  public async create(actionUserId: string, data: CreateDebtorDto): Promise<DebtorModel> {
    const user = await this.users.findById(actionUserId);

    const debtor = await this.prisma.debtor.create({ data: { name: data.name, color: data.color, userId: user.id } });

    return plainToClass(DebtorModel, debtor);
  }

  public async update(id: string, data: UpdateDebtorDto): Promise<DebtorModel> {
    const debtor = await this.findById(id);

    data.name = data.name ?? debtor.name;
    data.color = data.color ?? debtor.color;

    const updatedDebtor = await this.prisma.debtor.update({ where: { id }, data });

    return plainToClass(DebtorModel, updatedDebtor);
  }

  public async delete(id: string): Promise<void> {
    const debtor = await this.findById(id);

    await this.prisma.debtor.delete({ where: { id: debtor.id } });
  }
}
