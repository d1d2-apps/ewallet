import { Expose } from 'class-transformer';

import { UserModel } from '@src/modules/users/models/user.model';

export class CreditCardModel {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  userId: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  user: UserModel;
}
