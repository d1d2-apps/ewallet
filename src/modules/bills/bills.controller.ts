import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Request } from 'express';

import { BillsService } from './bills.service';
import { CreateBillDto } from './dtos/create-bill.dto';
import { UpdateBillDto } from './dtos/update-bill-dto';
import { BillModel } from './models/bill.model';

class IdParam {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

@Controller('bills')
export class BillsController {
  constructor(private bills: BillsService) {}

  @Get()
  public async findAll(@Req() req: Request): Promise<BillModel[]> {
    return this.bills.findAll(req.user.id);
  }

  @Post()
  public async create(@Body() createBillDto: CreateBillDto, @Req() req: Request): Promise<BillModel | BillModel[]> {
    return this.bills.create(req.user.id, createBillDto);
  }

  @Put(':id')
  public async update(@Body() updateBillDto: UpdateBillDto, @Req() req: Request, @Param() param: IdParam): Promise<BillModel> {
    return this.bills.update(req.user.id, param.id, updateBillDto);
  }
}
