import { Injectable, NotFoundException } from '@nestjs/common';

import { plainToClass, plainToInstance } from 'class-transformer';

import { PrismaService } from '@src/shared/database/prisma.service';

import { UsersService } from '../../users.service';
import { CreateOrUpdateCreditCardDto } from './dtos/create-or-update-credit-card.dto';
import { CreditCardModel } from './models/credit-card.model';

@Injectable()
export class CreditCardsService {
  constructor(private prisma: PrismaService, private users: UsersService) {}

  public async findById(id: string): Promise<CreditCardModel> {
    const creditCard = await this.prisma.creditCard.findUnique({ where: { id } });

    if (!creditCard) {
      throw new NotFoundException(`Credit card not found with id [${id}]`);
    }

    return plainToClass(CreditCardModel, creditCard);
  }

  public async findByUserId(userId: string): Promise<CreditCardModel[]> {
    const user = await this.users.findById(userId);

    const creditCards = await this.prisma.creditCard.findMany({ where: { userId: user.id } });

    return plainToInstance(CreditCardModel, creditCards);
  }

  public async create(actionUserId: string, data: CreateOrUpdateCreditCardDto): Promise<CreditCardModel> {
    const user = await this.users.findById(actionUserId);

    const creditCard = await this.prisma.creditCard.create({ data: { name: data.name, userId: user.id } });

    return plainToClass(CreditCardModel, creditCard);
  }

  public async update(id: string, data: CreateOrUpdateCreditCardDto): Promise<CreditCardModel> {
    const creditCard = await this.findById(id);

    data.name = data.name ?? creditCard.name;

    const updatedCreditCard = await this.prisma.creditCard.update({ where: { id }, data });

    return plainToClass(CreditCardModel, updatedCreditCard);
  }

  public async delete(id: string): Promise<void> {
    const creditCard = await this.findById(id);

    await this.prisma.creditCard.delete({ where: { id: creditCard.id } });
  }
}
