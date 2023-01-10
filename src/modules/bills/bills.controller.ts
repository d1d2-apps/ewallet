import { Body, Controller, Get, Post, Req } from '@nestjs/common';

import { Request } from 'express';

import { BillsService } from './bills.service';
import { CreateBillDto } from './dtos/create-bill.dto';
import { BillModel } from './models/bill.model';

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
}
