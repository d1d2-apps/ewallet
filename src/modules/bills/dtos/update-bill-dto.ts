import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { BillCategory } from '../models/bill.model';
import { UpdateBillDebtorDto } from './update-bill-debtor.dto';

export class UpdateBillDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  creditCardId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  @IsOptional()
  month: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  year: number;

  @IsString()
  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  totalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  installment: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  totalOfInstallments: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  paid: boolean;

  @IsString()
  @IsEnum(BillCategory)
  @IsOptional()
  category: BillCategory;

  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => UpdateBillDebtorDto)
  billDebtors!: UpdateBillDebtorDto[];
}
