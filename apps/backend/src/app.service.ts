import { Injectable } from '@nestjs/common';

export interface IRootResponse {
  message: string;
}

@Injectable()
export class AppService {
  public getHello(): IRootResponse {
    return { message: 'Welcome to the eWallet API' };
  }
}
