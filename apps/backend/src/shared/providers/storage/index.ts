import { FakeStorageProvider } from './fakes/fake-storage.provider';
import { FirebaseStorageProvider } from './implementations/firebase-storage.provider';
import { StorageProvider } from './implementations/storage.provider';

export const storageServiceProvider = {
  provide: StorageProvider,
  useClass: process.env.ENV === 'test' ? FakeStorageProvider : FirebaseStorageProvider,
};
