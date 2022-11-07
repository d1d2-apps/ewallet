import { Expose } from 'class-transformer';

export class ResetPasswordToken {
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
