import { IsOptional, IsNumber, IsUUID, IsNotEmpty } from 'class-validator';

export class FindBillsQueryDto {
  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  creditCardId?: string;
}
