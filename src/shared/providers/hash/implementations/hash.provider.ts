import { IHashProvider } from '../models/hash-provider.model';

export class HashProvider implements IHashProvider {
  public async generateHash(payload: string): Promise<string> {
    return;
  }

  public async compareHash(payload: string, hashed: string): Promise<boolean> {
    return;
  }
}
