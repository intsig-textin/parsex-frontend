import { getParamsSettings } from '@/pages/DashboardCommon/components/ParamsSettings/utils';
import {
  getResultCache,
  updateResultCache,
} from '@/pages/DashboardCommon/components/RobotLeftView/utils/cacheResult';
import type { IResponse } from '@/utils';
import {
  filterObject,
  paramToString,
  request,
  replaceFileSuffixName,
  uppercaseFileType,
  getOCRPrefix,
  requestWidthCache,
  getTextinPrefix,
} from '@/utils';

export interface IRobotTypeParams {
  type?: number;
  scene?: string;
  keyword?: string;
}

export async function getRobotList(params: IRobotTypeParams) {
  return request(`/robot?type=${params.type}`, {
    method: 'GET',
  });
}

export interface IRobotInfo {
  id: number;
  guid: any;
  name: string;
  description: string;
  service: string;
  image: string;
  interaction: number; // 0结构化；1文字；2表格；3文件转换；4图片转换
  ranking: number;
  status: number;
  scene: string;
  api_id: string;
  tCoin: number; // 机器人单价
  originalTCoin: number; // 机器人原价
  postpayStatus: number; // 0 否 1 是
  /**
   * @name 发布状态
   * @description
   * 1 可用
   * 2 不可用
   */
  publishStatus: 1 | 2;
  Isowned: number; // 1表示已经增加，0表示未增加
  type?: number;
  banner?: string;
  publishTime?: number;
  visibleType: number; // 0可见，1页面不可见，2商务可见
  url?: string; // 场景机器人地址
  interaction_uri: string;
  [key: string]: any;
}

export interface IRobotInfoResponse extends IResponse {
  data?: IRobotInfo;
}
export interface IMMarketRobotResponse extends IResponse {
  data: IRobotInfo[];
}
export async function getMarketRobotList(params?: IRobotTypeParams) {
  return request<IMMarketRobotResponse>(`/robot/market`, {
    method: 'POST',
    data: params && filterObject(params),
  });
}
export async function getUserMarketRobotList(open_id?: string) {
  return request.get<IMMarketRobotResponse>(`/boss/robot/list?open_id=${open_id}`);
}
export async function getAllMarketRobotList() {
  return request.get<IMMarketRobotResponse>(`/boss/robot/list?all=1`);
}
// 场景机器人列表
export async function getSceneRobotList() {
  return request(`/robot/scene_robot/market`, {
    method: 'POST',
  });
}

export interface IRobotDetailReq {
  service: string;
  robot_type?: 1 | 2 | 3; // 1通用/2场景/3自建
}

export interface IRobotApiInfo {
  id: string;
  url_params: Record<string, any>[];
  request_body_description: string;
  name: string;
  [key: string]: any;
}
export interface IRobotApiInfoResponse extends IResponse {
  data?: IRobotApiInfo;
}

export async function getRobotApiInfo(params: IRobotDetailReq) {
  const url = window._env_host?.DOC_URL || `${getTextinPrefix()}/document/info/${params.service}`;
  return request<IRobotApiInfoResponse>(url, {
    method: 'GET',
  });
}

export async function getRobotAndApiInfo(params: IRobotDetailReq) {
  return Promise.all([getRobotApiInfo(params)]);
}

export interface IMyRobotRes extends IResponse {
  data: IRobotInfo[];
}

export interface IUploadFilePros {
  service: string;
  data: File;
  [key: string]: any;
}

export interface IUploadFileResponse {
  code: number;
  data?: any;
  msg: string;
}

export async function uploadRobotFile({ data, ...param }: IUploadFilePros) {
  const url = '/robot/recognize';
  return request(paramToString(param, url), {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });
}

export interface IDownLoadFileReq {
  filename: string;
  content: string;
}

export interface IBatchDownLoadFileReq {
  filetype: string;
  result_type: number; // 导出结果类型 1、仅ocr，2、仅精准识别，3、OCR和精准识别
  ids: number[];
}

// 获取识别结果
interface IHistoryRes extends IResponse {
  data: {
    result: any;
    precise_result: any;
    pages?: any[];
  };
}
export async function robotRecognizeHistory(id: React.ReactText) {
  // 先读取缓存
  const cacheData = getResultCache(id);
  if (cacheData) {
    const result = { code: 200, msg: '', data: cacheData };
    console.log('robotRecognizeHistory-cache', result);
    // 等待
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 64);
    });
    return result;
  }
  return request<IHistoryRes>(`/service/history/${id}`);
}

export interface IUpdateHistory {
  id?: string | number;
  type: 1 | 2; // 1 ocr、2 精准识别
  data: any;
}
export async function robotUpdateHistory({ id, type, data }: IUpdateHistory) {
  updateResultCache(id, data);
  return request<IHistoryRes>(`/service/history/${id}/update/${type}`, {
    method: 'POST',
    data: { data },
  });
}

export interface IRecognizeReq {
  [key: string]: any;
  service?: string; // 标准机器人Id
  template?: string; // 自建机器人 guid
  id?: any;
  imgData?: any;
  exampleFlag?: boolean;
  imgName?: string;
  queryParams?: Record<string, any>;
}

interface IRecognizeRes extends IResponse {
  data: any;
  message?: string;
}

// 文档解析需要引擎返回图片进行预览的文件
export const mdNoPreview = (name: string) => {
  return !/\.(jpg|jpeg|pjp|pjpeg|jfif|png|bmp|tif[f]?|webp|svg|heif|heic|pdf)$/i.test(name);
};
export const imagePreview = (name: string) => {
  return /\.(jpg|jpeg|pjp|pjpeg|jfif|png|bmp|tif[f]?|webp|svg|heif|heic)$/i.test(name);
};

// OCR 识别针对1.3版本之后 @TODO: 文件名编码 encodeURIComponent
export async function robotRecognize({
  service,
  template,
  id,
  imgData,
  imgName,
  exampleFlag = false,
  queryParams,
}: IRecognizeReq) {
  let bodyOption = {};
  const extension = uppercaseFileType.find((item) => imgName?.endsWith(item));
  let param: Record<string, any> = {
    img_name: extension ? replaceFileSuffixName(imgName!, 'pdf') : imgName,
    history_id: id,
  };
  if (service) {
    param.service = service;
  }

  if (template) {
    param.template = template;
  }

  if (imgData) {
    bodyOption = {
      method: 'POST',
      data: imgData,
    };
    const { history_id, ...curParam } = param;
    param = { ...curParam };
    param.c_time = new Date().getTime();
  }
  if (exampleFlag) {
    const { history_id, ...curParam } = param;
    param = { ...curParam, img_name: id };
  }

  // 参数设置的值
  const curSettings = getParamsSettings();
  if (curSettings) {
    param = { ...param, ...curSettings };
  }

  if (queryParams) {
    param = { ...param, ...queryParams };
  }

  const isMarkdown = true;
  const filename = param.img_name || param.file_name || '';
  if (isMarkdown) {
    // 水印和切边，需要预览处理后的图片
    const needOcrPreview = param.remove_watermark || param.crop_enhance;
    if (needOcrPreview && imagePreview(filename)) {
      param.image_output_type = 'base64str';
    }
    // 前端无法预览的类型，需要引擎转的图片
    const cannotPreview = (!exampleFlag || param.file_name) && mdNoPreview(filename);
    if (needOcrPreview || cannotPreview) {
      param.get_image = ['objects', 'both'].includes(param.get_image) ? 'both' : 'page';
      param.page_details = 1;
    }
  }

  const { custom_api, 'x-ti-app-id': appId, 'x-ti-secret-code': secretCode, ...urlParams } = param;
  const requestUrl = custom_api || '/ai/service/v1/pdf_to_markdown';

  return request<IRecognizeRes>(paramToString(urlParams, requestUrl), {
    ...bodyOption,
    prefix: getOCRPrefix(),
    headers: {
      'x-ti-app-id': appId,
      'x-ti-secret-code': secretCode,
    },
  });
}

export interface IRobotSceneItemProp {
  id: number;
  scene: string;
}

export interface IRobotSceneResponse extends IResponse {
  data: IRobotSceneItemProp[];
}

export function downloadOcrImg(image_id: string) {
  // 参数设置的值
  const curSettings = getParamsSettings();
  const { 'x-ti-app-id': appId, 'x-ti-secret-code': secretCode } = curSettings || {};
  return requestWidthCache.get(`/ocr_image/download?image_id=${image_id}`, {
    // prefix: 'https://web-api.textin.com',
    forceHeader: true,
    headers: {
      'x-ti-app-id': appId,
      'x-ti-secret-code': secretCode,
    },
  });
}
