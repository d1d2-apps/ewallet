import { IsHexColor, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDebtorDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  @IsOptional()
  color: string;
}
