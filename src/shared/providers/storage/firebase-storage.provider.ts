import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Injectable } from '@nestjs/common';
import { IStorageProvider, IUploadResult } from './storage-provider.model';

@Injectable()
export class FirebaseStorageProvider implements IStorageProvider {
  public async uploadFile(file: Express.Multer.File, path: string, fileName: string): Promise<IUploadResult> {
    const storage = getStorage();

    const fileExtension = file.originalname.split('.').pop();
    const fileRef = ref(storage, `${path}/${fileName}.${fileExtension}`);

    const uploaded = await uploadBytes(fileRef, file.buffer);

    const fileURL = await getDownloadURL(fileRef);

    return { fileName: uploaded.metadata.name, fileURL };
  }

  public async deleteFile(path: string, fileName: string): Promise<void> {
    const storage = getStorage();

    const fileRef = ref(storage, `${path}/${fileName}`);

    await deleteObject(fileRef);
  }
}
