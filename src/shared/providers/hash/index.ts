import FakeHashProvider from './fakes/fake-hash.provider';
import { BCryptHashProvider } from './implementations/bcrypt-hash.provider';
import { HashProvider } from './implementations/hash.provider';

export const hashServiceProvider = {
  provide: HashProvider,
  useClass: process.env.ENV === 'test' ? FakeHashProvider : BCryptHashProvider,
};
