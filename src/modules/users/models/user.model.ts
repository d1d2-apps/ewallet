import { DebtorModel } from '@src/modules/debtors/models/debtor.model';
import { Exclude, Expose } from 'class-transformer';

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
}
