export interface IFile {
  url: string;
  id?: number | string;
  name: string;
  thumbnail?: string;
  isExample?: boolean;
  status: 'wait' | 'recognize' | 'complete' | 'upload' | 'timeout' | 'queue';
}
export interface IFileItem extends IFile {
  imageData?: any;
  active?: boolean;
  cloudOcr?: boolean; // 是否云识别
  cloudStatus?: 0 | 1 | 2 | 3; // 0:未识别 1:识别中 2:识别成功 3:识别失败
  time?: string;
  isLocalUpload?: boolean;
  [key: string]: any;
}
