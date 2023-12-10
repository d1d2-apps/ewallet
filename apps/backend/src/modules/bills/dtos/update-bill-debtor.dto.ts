import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateBillDebtorDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  debtorId: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  paid: boolean;
}
