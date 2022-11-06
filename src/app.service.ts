import { Injectable } from '@nestjs/common';

export interface IRootResponse {
  message: string;
}

@Injectable()
export class AppService {
  getHello(): IRootResponse {
    return { message: 'Welcome to the eWallet API' };
  }
}
