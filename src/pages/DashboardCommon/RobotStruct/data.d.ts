import type { IFile } from '@/pages/DashboardCommon/components/RobotLeftView/data.d';

export interface IFileItem extends IFile {
  cloudOcr?: boolean; // 是否云识别
  cloudStatus?: 0 | 1 | 2 | 3; // 0:未识别 1:识别中 2:识别成功 3:识别失败
  time?: string;
  id: number;
  result?: any;
  [key: string]: any;
}

export interface IImgResult {
  image_angle?: string;
  item_list?: IItemList[];
  rotated_image_height?: string;
  rotated_image_width?: any;
  table_list?: [];
  type?: string;
  type_description?: boolean;
  details?: any[];
  [key: string]: any;
}

export interface IItemList {
  uid: string;
  key: string;
  value: string;
  position?: number[];
  description: string;
  active: boolean;
  confidence?: number;
  type: 'img' | 'text' | string;
  number?: string;
  points?: number[];
  image?: string;
  [key: string]: any;
}
export interface DetailsItem {
  value: string;
  position: number[];
  image?: string;
  description?: string;
}
export type DetailsItemValue = DetailsItem | DetailsItem[];
export type DetailList = {
  key: string;
  lines: DetailsItemValue;
};
export enum KeyTypeEnum {
  ITEM_LIST = 'item_list',
  DETAILS = 'details',
}
export enum ResultType {
  json = 'json',
  text = 'text',
}

export interface IRectListItem {
  uid: string;
  points: number[];
  value?: string;
  [index: string]: any;
}
