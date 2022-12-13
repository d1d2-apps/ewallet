import { IStorageProvider, IUploadResult } from '../models/storage-provider.model';

interface IFakeStorage {
  file: Express.Multer.File;
  path: string;
  fileName: string;
}

export class FakeStorageProvider implements IStorageProvider {
  private storage: IFakeStorage[] = [];

  public async uploadFile(file: Express.Multer.File, path: string, fileName: string): Promise<IUploadResult> {
    this.storage.push({ file, path, fileName });

    return { fileName, fileURL: `${path}/${fileName}` };
  }

  public async deleteFile(path: string, fileName: string): Promise<void> {
    const findIndex = this.storage.findIndex((storageFile) => storageFile.fileName === fileName);

    this.storage.splice(findIndex, 1);
  }
}
