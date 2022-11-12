import { UserModel } from '@src/modules/users/models/user.model';
import { Expose } from 'class-transformer';

export class DebtorModel {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  userId: string;

  @Expose()
  color: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  user: UserModel;
}
