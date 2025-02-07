import { saveAs } from 'file-saver';
import { isMobile } from '@/utils/hooks';
import dayjs from 'dayjs';

/**
 * @desc 下载文件
 * @param data 数据源
 * @param fileName  原文件名
 * @param ext [可选]替换的扩展名
 */
export const downloadFile = (data: string | Blob, fileName: string, ext?: string) => {
  let curFileName = fileName;
  // 兼容手机端
  if (isMobile()) {
    const elementA = document.createElement('a');
    curFileName = fileName.replace(/\.\w+$/, `.${ext}`);
    elementA.download = curFileName;
    elementA.style.display = 'none';
    // blob直接下载
    if (ext === 'cvs') {
      elementA.href = URL.createObjectURL(data as Blob);
    } else {
      elementA.href = <string>data;
    }
    document.body.appendChild(elementA);
    elementA.click();
    document.body.removeChild(elementA);
  } else {
    if (ext) {
      curFileName = fileName.replace(/\.\w+$/, `.${ext}`);
    }
    saveAs(data, curFileName);
  }
};

export const trimDataToURL = (data: string) => data.replace(/^data:.*?;base64,/, '');
export const addDataToURL = (data: string, mime: string) => `data:image/${mime};base64,${data}`;

const base64ToBuffer = (base64: string) => {
  const binary = atob(trimDataToURL(base64));
  const { length } = binary;
  const buffer = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = binary.charCodeAt(i) & 0xff;
  }
  return buffer;
};

export function blobToFile(blob: any, fileName: any) {
  // fileName 是你想给文件起的名字
  return new File([blob], fileName, { type: blob.type });
}

export const base64ToURL = (base64: any) => {
  const data = base64ToBlob(base64);
  return URL.createObjectURL(data);
};

export const base64ToBlob = (base64: any) => {
  return new Blob([base64ToBuffer(base64)], {
    type: 'application/octet-stream',
  });
};
export const readFileAsArrayBuffer = async (file: File | Blob) => {
  // try {
  //   const result = await blobToDataURL(file);
  //   return base64ToBlob(result);
  // } catch (e) {
  //   throw e;
  // }
  return new Promise<Blob>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function (e) {
      resolve(e.target?.result as unknown as Blob);
      //resolve(e.target?.result)
    };
    reader.onerror = (e) => {
      reject(e);
    };
  });
};
export function blobToDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject('资源加载失败');
    };
  });
}

const fileTypes = [
  'image/bmp',
  'image/jpeg',
  'image/pjpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

export function validImgFileType(file: string, addFileTypes: string[] = []) {
  return [...fileTypes, ...addFileTypes].includes(file);
}

export const notSupportPreView = (name: string) => {
  const { type } = getFileNameAndType(name);
  return ['xls', 'xlsx'].some((curType) => curType === type);
};
/**
 * 替换文件后缀名
 */
export function replaceFileSuffixName(name: string, newExt: string) {
  return name.replace(/(\.[a-z]+)?$/i, `.${newExt}`);
}

export const generateUUID = (): string => {
  let dateData = new Date().getUTCDate();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
    const randomData = (dateData + Math.random() * 16) % 16 | 0;
    dateData = Math.floor(dateData / 16);
    return (c == 'x' ? randomData : (randomData & 0x3) | 0x8).toString(16);
  });
  return uuid;
};

const SPLIT_COMM = '__**TEXTIN**__';

export const getFileNameAndType = (name: string) => {
  const [fileName, type] = name.replace(/(.)\.(\w+)$/, `$1${SPLIT_COMM}$2`).split(SPLIT_COMM);
  return { fileName, type: type?.toLowerCase() };
};
export const getDownloadName = (originFileName: string, type?: string) => {
  const { fileName, type: originType } = getFileNameAndType(originFileName);
  const name: string = `TextIn_${fileName}_${dayjs().format('MMDDHHmmss')}`;
  const filetype = type || originType;
  return `${name}.${filetype}`;
};

export const getDownloadReportName = () => {
  return `Textin_report_${dayjs().format('YYMMDDHHmmss')}`;
};
export const uppercaseFileType = ['.PDF', '.OFD'];

export const suffixMapMIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  gif: 'image/gif',
  pdf: 'application/pdf',
};

export function getAcceptType(accept: string) {
  const type = accept.replace(/\./g, '');
  return suffixMapMIME[type] || (type.includes('.') ? type : `.${type}`);
}

export function getAccept(accept?: string | any[]) {
  if (!accept) return '';
  if (Array.isArray(accept)) {
    const acceptList = accept.filter((type) => type).map((type) => getAcceptType(type));
    return [...new Set(acceptList)].join();
  } else {
    return getAcceptType(accept);
  }
}

export function checkType(file: any, accept = '') {
  if (!file) return false;
  if (accept.length === 0) return true;
  const { type, name } = file;
  const acceptStr = Array.isArray(accept) ? accept.join() : accept;
  const extension = name.indexOf('.') > -1 ? `.${name.split('.').pop()?.toLowerCase()}` : '';
  if (acceptStr.includes('image/*') && type.includes('image')) return true;
  return acceptStr
    .toLowerCase()
    .split(',')
    .map((type) => type?.trim())
    .filter((type) => type)
    .some((acceptMIME) => type === acceptMIME || acceptMIME === extension);
}
