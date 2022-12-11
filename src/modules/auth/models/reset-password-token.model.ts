import { Expose } from 'class-transformer';

export class ResetPasswordTokenModel {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  expiresIn: Date;

  @Expose()
  active: boolean;

  @Expose()
  createdAt: Date;
}
