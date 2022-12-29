export interface IUploadResult {
  fileName: string;
  fileURL: string;
}

export interface IStorageProvider {
  uploadFile(file: Express.Multer.File, path: string, fileName: string): Promise<IUploadResult>;
  deleteFile(path: string, fileName: string): Promise<void>;
}
