import { DebtorModel } from '@src/modules/users/modules/debtors/models/debtor.model';
import { Exclude, Expose } from 'class-transformer';

import { CreditCardModel } from '../modules/credit-cards/models/credit-card.model';

export class UserModel {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  picture: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  debtors?: DebtorModel[];

  @Expose()
  creditCards?: CreditCardModel[];
}
