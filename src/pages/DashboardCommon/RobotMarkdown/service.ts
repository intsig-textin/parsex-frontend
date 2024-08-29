/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IResponse } from '@/utils';
import { getOCRPrefix, request } from '@/utils';
interface ExtractServiceReq {
  keys: string[];
  file: string;
}
export interface OcrDataItem {
  index: number;
  angle: number;
  original_angle: number;
  width: number;
  height: number;
  image_bytes: string;
  image_scale: number;
  image_type: string;
}
interface OcrDataRes extends IResponse {
  //   code: number;
  //   message: string;
  //   version: string;
  //   duration: number;
  data: {
    result: {
      pages: OcrDataItem[];
    };
  };
}
export interface CharInfo {
  page_index: number;
  char: string;
  rotation: number;
  polygons: number[];
}
interface Candidate {
  value: string;
  score: number;
  range: string;
  chars_info: CharInfo[];
}
export interface ILines {
  page: number;
  pos: number[];
  text: string;
  char_pos: number[][];
}
export interface ExtractItem {
  key: string;
  value: string;
  score: number;
  nonscore: number;
  candidates: Candidate[];
  lines?: ILines[];
}
export interface ExtractResult {
  pages_count: number;
  keys_count: number;
  item_list: ExtractItem[];
  pages: OcrDataItem[];
}
export interface ExtractListRes extends IResponse {
  //   code: number;
  //   message: string;
  //   version: string;
  //   duration: number;
  message?: string;
  data: {
    result: ExtractResult;
  };
}

export const queryOcrDataService = (data: Blob) => {
  ///ai/service/v1/ocr-data
  return request.post<OcrDataRes>('/home/user_trial_ocr?service=ocr-data', {
    data,
    prefix: getOCRPrefix(),
  });
};
export const docParserService = (data: Blob, dpi = 120) => {
  ///ai/service/v1/ocr-data
  return request.post<OcrDataRes>(
    `/home/user_trial_ocr?service=doc-parser&return_image=1&dpi=${dpi}&force_ocr=1`,
    {
      data,
      prefix: getOCRPrefix(),
    },
  );
};

interface IsetParams {
  settings: {
    saveConfigResult?: any;
  };
}
interface IsetResponseConfig extends IResponse {
  data: {
    service: string;
  };
}
// export const SaveConfigService = (params: IsetParams, service: string) => {
//   return request<IsetResponseConfig>(`/user/settings/robot/${service}/update`, {
//     method: 'POST',
//     data: params,
//   });
// };

interface IResponseConfig extends IResponse {
  data: {
    service: string;
    settings: Record<string, any>;
  };
}
// export const gatConfigService = (service: string) => {
//   return request.get<IResponseConfig>(`/user/settings/robot/${service}/info`);
// };
export const getRecordParams = (id: string) => {
  return request.get(`/backend/robot/recognize/detail?id=${id}`);
};
