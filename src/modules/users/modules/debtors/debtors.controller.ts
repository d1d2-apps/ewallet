import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Request } from 'express';

import { DebtorsService } from './debtors.service';

import { DebtorModel } from './models/debtor.model';

import { CreateDebtorDto } from './dtos/create-debtor.dto';
import { UpdateDebtorDto } from './dtos/update-debtor.dto';

class IdParam {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

@Controller('/users/debtors')
export class DebtorsController {
  constructor(private debtors: DebtorsService) {}

  @Get()
  public async findByUserId(@Req() req: Request): Promise<DebtorModel[]> {
    return this.debtors.findByUserId(req.user.id);
  }

  @Get(':id')
  public async findById(@Param() param: IdParam): Promise<DebtorModel> {
    return this.debtors.findById(param.id);
  }

  @Post()
  public async create(@Body() body: CreateDebtorDto, @Req() req: Request): Promise<DebtorModel> {
    return this.debtors.create(req.user.id, body);
  }

  @Put(':id')
  public async update(@Param() param: IdParam, @Body() body: UpdateDebtorDto): Promise<DebtorModel> {
    return this.debtors.update(param.id, body);
  }

  @Delete(':id')
  public async delete(@Param() param: IdParam): Promise<void> {
    return this.debtors.delete(param.id);
  }
}
