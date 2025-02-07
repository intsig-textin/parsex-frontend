import type { IResponse } from '@/utils';
import { request } from '@/utils';

// 0:未识别 1:识别中 2:识别成功 3:识别失败
type CloudStatus = 0 | 1 | 2 | 3;

// 1、识别成功、2、识别失败
type ocrStatus = 1 | 2;

export interface IListItem {
  id: number;
  img_name: string;
  img_uri: string;
  ocr_status: ocrStatus;
  count_status: 0 | 1; // 表示当前次识别次数是否充足
  status: CloudStatus;
  cloud_ocr: 0 | 1;
  thumbnail: string;
  ctime: number;
  utime: number;
}
export interface IQueryListRes extends IResponse {
  data: {
    total_num: number;
    page_size: number;
    page_num: number;
    data: IListItem[];
  };
}

export interface IPreciseRecognizeReq {
  service: string;
  robotType: string;
  id: string | number;
  imgName?: string;
}
interface IRobotPreciseRes extends IResponse {
  data: IListItem;
}

export async function robotPreciseRecognize({
  service,
  robotType = '1',
  id,
  imgName,
}: IPreciseRecognizeReq) {
  return request<IRobotPreciseRes>(
    `/robot/precise_recognize?service=${service}&robot_type=${robotType}&history_id=${id}&img_name=${imgName}`,
    {
      method: 'POST',
    },
  );
}
interface IRobotPreciseStatusRes extends IResponse {
  data: { id: number; status: CloudStatus }[];
}
export async function robotPreciseStatus(ids: (number | string)[]) {
  return request<IRobotPreciseStatusRes>('/robot/precise_status', {
    method: 'POST',
    data: { ids },
  });
}
