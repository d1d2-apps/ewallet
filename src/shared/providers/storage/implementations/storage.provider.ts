import { Injectable } from '@nestjs/common';

import { IStorageProvider, IUploadResult } from '../models/storage-provider.model';

@Injectable()
export class StorageProvider implements IStorageProvider {
  public async uploadFile(file: Express.Multer.File, path: string, fileName: string): Promise<IUploadResult> {
    return;
  }

  public async deleteFile(fileURL: string): Promise<void> {
    return;
  }
}
