import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrUpdateCreditCardDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
