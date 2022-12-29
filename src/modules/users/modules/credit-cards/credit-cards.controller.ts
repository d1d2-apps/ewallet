import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Request } from 'express';

import { CreditCardsService } from './credit-cards.service';
import { CreateOrUpdateCreditCardDto } from './dtos/create-or-update-credit-card.dto';
import { CreditCardModel } from './models/credit-card.model';

class IdParam {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

@Controller('/users/credit-cards')
export class CreditCardsController {
  constructor(private creditCards: CreditCardsService) {}

  @Get()
  public async findByUserId(@Req() req: Request): Promise<CreditCardModel[]> {
    return this.creditCards.findByUserId(req.user.id);
  }

  @Get(':id')
  public async findById(@Param() param: IdParam): Promise<CreditCardModel> {
    return this.creditCards.findById(param.id);
  }

  @Post()
  public async create(@Body() body: CreateOrUpdateCreditCardDto, @Req() req: Request): Promise<CreditCardModel> {
    return this.creditCards.create(req.user.id, body);
  }

  @Put(':id')
  public async update(@Param() param: IdParam, @Body() body: CreateOrUpdateCreditCardDto): Promise<CreditCardModel> {
    return this.creditCards.update(param.id, body);
  }

  @Delete(':id')
  public async delete(@Param() param: IdParam): Promise<void> {
    return this.creditCards.delete(param.id);
  }
}
