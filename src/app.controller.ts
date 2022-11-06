import { Controller, Get } from '@nestjs/common';
import { AppService, IRootResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): IRootResponse {
    return this.appService.getHello();
  }
}
