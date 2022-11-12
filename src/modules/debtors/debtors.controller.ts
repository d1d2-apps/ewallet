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

class UserIdParam {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

@Controller('debtors')
export class DebtorsController {
  constructor(private debtors: DebtorsService) {}

  @Get(':id')
  public async findById(@Param() param: IdParam): Promise<DebtorModel> {
    return this.debtors.findById(param.id);
  }

  @Get('/users/:userId')
  public async findByUserId(@Param() param: UserIdParam): Promise<DebtorModel[]> {
    return this.debtors.findByUserId(param.userId);
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
