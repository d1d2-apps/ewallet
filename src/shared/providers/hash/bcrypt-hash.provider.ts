import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { IHashProvider } from './hash-provider.model';

@Injectable()
export class BCryptHashProvider implements IHashProvider {
  public async generateHash(payload: string): Promise<string> {
    return hash(payload, 8);
  }

  public async compareHash(payload: string, hashed: string): Promise<boolean> {
    return compare(payload, hashed);
  }
}
