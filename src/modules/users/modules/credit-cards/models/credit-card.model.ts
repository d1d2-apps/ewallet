import { UserModel } from '@src/modules/users/models/user.model';
import { Expose } from 'class-transformer';

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
