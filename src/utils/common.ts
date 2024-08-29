/* eslint-disable no-param-reassign */
import dayjs from 'dayjs';
import { parse } from 'querystring';
import { formatMoney, imageUrl } from '.';

export function isValidAngle(angle: number) {
  return [0, 90, 180, 270].includes(angle);
}

// 数字千分位分隔
export const separateNumber = (num: number | string, precision?: number) => {
  if (!num) {
    return '0';
  }

  return formatMoney(num, precision);
};

export const mobileRegEx = /^1[3456789]\d{9}$/;
export const emailRegEx =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const isMobileNumber = (val: string) => {
  return mobileRegEx.test(val);
};

export const isEmail = (val: string) => emailRegEx.test(val);

/**
 * @name  判断激活码是否永久有效
 * @param code 十位时间戳
 */
export const PERMANENT_TIME = 1893427200;

export const isPermanentTimeCode = (code: string | number) => {
  if (typeof code === 'number') {
    code = `${code}`;
  }
  if (code?.length === 10) {
    return +code >= 1893427200;
  }
  if (code?.length === 13) {
    return +code >= 1893427200000;
  }
  return false;
};

/**
 * 校验白名单
 */
const WhiteList = [/\/recognition/];

export const isWhiteList = (path: string) => {
  return WhiteList.some((regx) => regx.test(path));
};

//
export const formattQuery = (search: string) => {
  if (!search) {
    return;
  }
  const queryList = (search && search.replace('?', '').split('?')) || [];
  const options: Record<string, string> = {};
  queryList.forEach((item) => {
    const [name, value] = item.split('=');
    options[name] = value;
  });
  return options;
};

export function timeStampFormat(time: number | string | undefined | null, formatString?: string) {
  const string = formatString || 'YYYY/MM/DD';
  if (!time) {
    return '-';
  }
  if (time == 0) {
    return '-';
  }
  if (typeof time === 'number') {
    time = `${time}`;
  }
  if (time.length === 13) {
    return dayjs(+time).format(string);
  }
  if (time.length === 10) {
    time = +time * 1000;
    return dayjs(+time).format(string);
  }
  return '-';
}

export const isNil = (value: any) => value === null || value === undefined;

export const getStaticImgURL = (filename: string) => `${imageUrl}?filename=${filename}`;

export const getPageQuery = () => parse(window.location.href.split('?')[1]);
export const delay = (delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, delay);
  });
};

// 计费单位
export const getUnit = (row?: Record<string, any>) => {
  const unitMap = {
    '0': '次',
    '1': '页',
    '2': '张',
  };
  return unitMap[String(row?.deduction_method)] || unitMap['0'];
};
