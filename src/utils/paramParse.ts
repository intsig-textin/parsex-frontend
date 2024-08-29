/* eslint-disable no-return-assign */
export function toHump(name: string): string {
  return name.replace(/_(\w)/g, (all, letter) => {
    return letter.toUpperCase();
  });
}
export function toLine(name: string) {
  return name.replace(/\B([A-Z])/g, '_$1').toLowerCase();
}
export function ObjectKeyToHump<T>(obj: T) {
  if (!obj) return {} as T;
  return Object.keys(obj).reduce((acc: any, curKey) => {
    acc[toHump(curKey)] = obj[curKey as keyof typeof obj];
    return acc;
  }, {} as T);
}

export function ObjectKeyToLine<T>(obj: T) {
  if (!obj) return {} as T;
  return Object.keys(obj).reduce((acc: any, curKey) => {
    acc[toLine(curKey)] = obj[curKey as keyof typeof obj];
    return acc;
  }, {} as T);
}

/**
 * @description 过滤掉对象中的 ''| [] | undefined 等值
 * @param obj Object
 *
 */
export const filterObject = (obj: Record<string, any>) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    return isTruthy(value) ? { ...acc, [key]: value } : acc;
  }, {});
};

function isTruthy(value: any) {
  if (Array.isArray(value) && !value.length) {
    return false;
  }
  return Boolean(value);
}

export function paramToString(param: Record<string, any>, url: string) {
  if (!param) {
    return url;
  }
  const list: string[] = [];
  Object.keys(param).forEach((key) => {
    if (param.hasOwnProperty(key)) {
      list.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(param[key] == null ? '' : param[key])}`,
      );
    }
  });
  if (list.length) {
    // eslint-disable-next-line no-return-assign
    // eslint-disable-next-line no-bitwise
    return (url += (~url.indexOf('?') ? '&' : '?') + list.join('&'));
  }
  return url;
}
