/* eslint-disable no-underscore-dangle */
import type { ResponseError } from 'umi-request';
import umiRequest, { extend } from 'umi-request';
import { isWhiteList } from './common';
import { notification } from 'antd';
import { ObjectKeyToLine } from './paramParse';
import { env, getEnv } from './env';

const codeMessage: Record<string, string> = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '登录失效',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '验证码错误',
  410: '请求的资源被永久删除，且不会再得到的。',
  413: '上传的文件太大',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
  440: '请求频繁',
};

// 响应体code对应message
export const messageByCode: Record<string, string> = {
  40003: '账户余额不足',
  40004: '参数错误，请查看技术文档，检查传参',
  40007: '机器人不存在或未发布',
  40008: '机器人未开通，请至市场开通后重试',
  40301: '图片类型不支持',
  40302: '上传文件大小不符，文件大小不超过 50M',
  40303: '文件类型不支持',
  40304: '图片尺寸不符，图像宽高须介于 20 和 10000（像素）之间',
  40305: '识别文件未上传',
  40306: 'qps超过限制',
  30203: '基础服务故障，请稍后重试',
};

// 统一异常处理
const errorHandler = async (error: ResponseError<any>): Promise<Response> => {
  const { response, request } = error;
  if (response && response.status) {
    response.clone();
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    // abort request
    if (
      (typeof error?.message === 'string' &&
        error?.message.includes('The user aborted a request.')) ||
      error instanceof umiRequest.Cancel
    ) {
      return Promise.reject(error);
    }
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  throw error;
};

export const envUrl = {
  // [env.TEST]: 'https://textin-sandbox.intsig.com',
  [env.TEST]: 'https://api.textin.com',
  [env.PRODUCTION]: 'https://web-api.textin.com',
};

export const ocrUrl = {
  // [env.TEST]: 'https://textin-sandbox.intsig.com',
  [env.TEST]: 'https://api.textin.com',
  [env.PRODUCTION]: 'https://api.textin.com',
};

export const getTextinPrefix = () => envUrl[getEnv()];
export const getOCRPrefix = () => ocrUrl[getEnv()];

export const request = extend({
  errorHandler,
  credentials: 'same-origin',
  mode: 'cors',
  headers: {
    'Cache-Control': 'no-cache',
    pragma: 'no-cache',
  },
  prefix: getTextinPrefix(),
});
export default request;

// 拦截器
request.interceptors.request.use((url, options: any) => {
  if (options.deleteToken) delete options.headers.token;

  const { data } = options;
  if (data && !(data instanceof Blob) && !(data instanceof File)) {
    const params = ObjectKeyToLine(data);
    Object.assign(options, {
      data: params,
    });
  }

  return {
    url,
    options,
  };
});

export interface IResponse {
  code: number;
  msg: string;
}

export interface IPaginationReq {
  pageSize: number;
  pageNum: number;
}
