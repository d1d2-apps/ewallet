import { Expose } from 'class-transformer';

import { UserModel } from '@src/modules/users/models/user.model';
import { CreditCardModel } from '@src/modules/users/modules/credit-cards/models/credit-card.model';

import { BillDebtorModel } from './bill-debtor.model';

export class BillModel {
  @Expose()
  id: string;

  @Expose()
  creditCardId: string;

  @Expose()
  userId: string;

  @Expose()
  month: number;

  @Expose()
  year: number;

  @Expose()
  date: Date;

  @Expose()
  totalAmount: number;

  @Expose()
  installment: number;

  @Expose()
  totalOfInstallments: number;

  @Expose()
  description: string;

  @Expose()
  paid: boolean;

  @Expose()
  category: BillCategory;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  creditCard?: CreditCardModel;

  @Expose()
  user?: UserModel;

  @Expose()
  billDebtors?: BillDebtorModel[];
}

export enum BillCategory {
  HOUSE = 'HOUSE',
  EDUCATION = 'EDUCATION',
  ELECTRONICS = 'ELECTRONICS',
  LEISURE = 'LEISURE',
  OTHERS = 'OTHERS',
  RESTAURANT = 'RESTAURANT',
  HEALTH = 'HEALTH',
  SERVICES = 'SERVICES',
  SUPERMARKET = 'SUPERMARKET',
  TRANSPORT = 'TRANSPORT',
  CLOTHING = 'CLOTHING',
  TRAVEL = 'TRAVEL',
}
