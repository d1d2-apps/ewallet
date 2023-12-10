import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateBillPaidStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  paid: boolean;
}
