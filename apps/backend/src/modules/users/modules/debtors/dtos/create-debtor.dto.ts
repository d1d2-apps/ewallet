import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

export class CreateDebtorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  color: string;
}
