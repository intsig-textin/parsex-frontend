import { getAccept, request } from '@/utils';
import { useCallback, useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';

const defaultMap: Record<string, string[]> = {
  'pdf-to-word': ['pdf'],
  'pdf-to-excel': ['pdf'],
  'pdf-to-ppt': ['pdf'],
  'pdf-to-image': ['pdf'],
  'word-to-pdf': ['doc', 'docx'],
  'word-to-image': ['doc', 'docx'],
  'excel-to-pdf': ['xls', 'xlsx', 'csv'],
  'image-to-pdf': ['jpg', 'jpeg', 'png', 'bmp'],
};

export function formatSuffix(description: string, service?: string) {
  const defaultRes = { acceptStr: '*', acceptDes: '*' };
  if (!description || typeof description !== 'string' || !service) return defaultRes;
  let des = description.trim().replace(/[等]$/, '').replace(/body/, '');
  if (Array.isArray(des)) des = des.join(',');
  if (des && typeof des === 'string') {
    let result: any = {};
    const separator = des.includes(',') ? ',' : '、';
    const accept = des
      .split(separator)
      .map((item) => {
        const row = item.trim().match(/[a-zA-Z]+/);
        const type = row && row[0];
        return type;
      })
      .filter((item) => item);
    const defaultAccept = defaultMap[service];
    if (!accept.length && defaultAccept) {
      result = { acceptStr: getAccept(defaultAccept), acceptDes: defaultAccept.join(', ') };
    } else {
      result = { acceptStr: getAccept(accept), acceptDes: des };
      if (!result.acceptStr.includes('image') && /(图片|图像)/.test(des)) {
        result.acceptStr += ',image/*';
      }
    }
    // 图片默认加上heif
    if (['image', 'png', 'jpg', 'jpeg', 'bmp'].some((item) => result.acceptStr?.startsWith(item))) {
      result.acceptStr += ',.heif,.heic';
    }
    return result;
  }
  return defaultRes;
}

enum defaultParamsType {
  default = 'default',
  double = 'double',
}

// 识别参数
export const defaultShowUrlParams: Record<string, any> = {
  // manipulation_detection: {
  //   // PS检测
  //   title: '选择检测文件类型',
  //   keys: ['category'],
  //   defaultParams: defaultParamsType.double,
  // },
};

interface UrlParams {
  key: string;
  description: string;
  enum: any[];
  required: boolean;
  [key: string]: any;
}

export function formatUrlParams(params: UrlParams[], service: string) {
  if (Array.isArray(params) && defaultShowUrlParams[service]) {
    const options = params
      .filter((item) => item.enum)
      .map((item) => ({
        ...item,
        key: item.key,
        required: item.required,
        options: item.description
          ?.split('\n')
          .map((op) => op.replace(/<\/?[a-z]+>/g, '').replace(/^[0-9]+\s+/, ''))
          .filter((op) => op)
          .map((op, i) => ({ label: op, value: item.enum[i] })),
      }))
      .filter((item) => defaultShowUrlParams[service]?.keys?.includes(item.key));
    return { title: defaultShowUrlParams[service]?.title, options };
  }
  return undefined;
}

interface ParamsProp {
  title: string;
  options: Record<string, any>[];
}

export function useUploadFormat(props?: { curRobot: any; [key: string]: any }) {
  const { service, api_document } = props?.curRobot || {};

  const [documentInfo, setDocumentInfo] = useState<Record<string, any>>();
  const [urlParams, setUrlParams] = useState<ParamsProp | undefined>();
  const [modalInfo, setModalInfo] = useState<Record<string, any>>({ visible: false });
  const [collapsed, setCollapsed] = useState(false);
  const [reRecognizeDeps, setReRecognizeDeps] = useState(0);

  useEffect(() => {
    if (!service) return;
    if (props?.curRobot) {
      if (api_document?.id === service) {
        formatHandle(api_document);
        return;
      }
    }
  }, [service, api_document]);

  function formatHandle(data: any) {
    if (!data) return;
    const params = formatUrlParams(data.url_params, data.id);
    setUrlParams(params);
    setDocumentInfo(data);
  }

  /**
   * 获取样本默认参数
   * 默认取 【样本】和【API文档url_params中enum】对应的index的值
   */
  const getDefaultUrlParams = useCallback(
    (index: number) => {
      let curUrlParams = urlParams;
      if (!curUrlParams) {
        const data = props?.curRobot.api_document || {};
        curUrlParams = formatUrlParams(data.url_params, data.id);
      }
      if (!service) return {};
      const params = defaultShowUrlParams[service]?.defaultParams;
      if (curUrlParams?.options?.length === 1) {
        let defaultParams: any[] = curUrlParams?.options[0].options.map((item: any) => ({
          [curUrlParams?.options[0].key]: item.value,
        }));
        if (params === defaultParamsType.double) {
          defaultParams = defaultParams.reduce((pre: any[], cur) => [...pre, ...[cur, cur]], []);
        }
        return defaultParams[index];
      } else if (params && typeof params === 'object') {
        return params;
      }
      return {};
    },
    [service, urlParams],
  );

  return {
    urlParams,
    getDefaultUrlParams,
    modalInfo,
    setModalInfo,
    documentInfo,
    collapsed,
    setCollapsed,
    reRecognizeDeps,
    setReRecognizeDeps,
  };
}

export default createContainer(useUploadFormat);
