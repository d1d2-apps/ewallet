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
import { CreateBillDebtorDto } from './create-bill-debtor.dto';

export class BillDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  creditCardId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsString()
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  installment: number;

  @IsNumber()
  @IsNotEmpty()
  totalOfInstallments: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  paid: boolean;

  @IsString()
  @IsEnum(BillCategory)
  category: BillCategory;

  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => CreateBillDebtorDto)
  billDebtors!: CreateBillDebtorDto[];
}

export class CreateBillDto {
  @IsDefined()
  @IsOptional()
  @ValidateNested()
  @Type(() => BillDto)
  bill?: BillDto;

  @IsDefined()
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => BillDto)
  bills?: BillDto[];
}
