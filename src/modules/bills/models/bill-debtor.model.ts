import { Expose } from 'class-transformer';

import { BillModel } from './bill.model';
import { UserModel } from '@src/modules/users/models/user.model';
import { DebtorModel } from '@src/modules/users/modules/debtors/models/debtor.model';

export class BillDebtorModel {
  @Expose()
  id: string;

  @Expose()
  billId: string;

  @Expose()
  userId?: string;

  @Expose()
  debtorId?: string;

  @Expose()
  amount: number;

  @Expose()
  description: string;

  @Expose()
  paid: boolean;

  @Expose()
  bill?: BillModel;

  @Expose()
  user?: UserModel;

  @Expose()
  debtor?: DebtorModel;
}
