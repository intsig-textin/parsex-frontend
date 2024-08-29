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
  if (!description || typeof description !== 'string' || !service) return {};
  let des = description.replace(/[等]$/, '').replace(/body/, '');
  if (Array.isArray(des)) des = des.join(',');
  if (des && typeof des === 'string') {
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
    let result;
    if (!accept.length && defaultAccept) {
      result = { acceptStr: getAccept(defaultAccept), acceptDes: defaultAccept.join(', ') };
    }
    result = { acceptStr: getAccept(accept), acceptDes: des };
    if (!result.acceptStr.includes('image') && /(图片|图像)/.test(des)) {
      result.acceptStr += ',image/*';
    }
    return result;
  }
  return {};
}

enum defaultParamsType {
  default = 'default',
  double = 'double',
}

// 识别参数
export const defaultShowUrlParams: Record<string, any> = {
  manipulation_detection: {
    // PS检测
    title: '选择检测文件类型',
    keys: ['category'],
    defaultParams: defaultParamsType.double,
  },
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
  const [acceptStr, setAcceptStr] = useState<string>();
  const [acceptDes, setAcceptDes] = useState<string>();
  const [urlParams, setUrlParams] = useState<ParamsProp | undefined>();
  const [modalInfo, setModalInfo] = useState<Record<string, any>>({ visible: false });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!service) return;
    if (api_document?.id) {
      formatHandle(api_document);
      return;
    } else {
      request.get(`/document/info/${service}`).then((res) => {
        formatHandle(res.data);
      });
    }
  }, [service, api_document]);

  function formatHandle(data: any) {
    if (!data) return;
    const description = data.request_body_description;
    const result = formatSuffix(description, service);
    const params = formatUrlParams(data.url_params, data.id);
    setAcceptDes(result?.acceptDes);
    setAcceptStr(result?.acceptStr);
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
    acceptDes,
    acceptStr,
    urlParams,
    getDefaultUrlParams,
    modalInfo,
    setModalInfo,
    documentInfo,
    collapsed,
    setCollapsed,
  };
}

export default createContainer(useUploadFormat);
