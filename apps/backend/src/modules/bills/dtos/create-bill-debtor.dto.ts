import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBillDebtorDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  debtorId?: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  userId?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  paid: boolean;
}
