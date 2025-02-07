const cacheKey = '_result_cache';
const cacheLength = 50;

/**
 * 通用set
 */
export const setResultCache = (data: any) => {
  if (data?.id) {
    if (!Array.isArray(window[cacheKey])) {
      window[cacheKey] = [];
    }
    const index = Array.isArray(window[cacheKey])
      ? window[cacheKey].findIndex((item: any) => item.id === data.id)
      : -1;
    if (index > -1) {
      window[cacheKey].splice(index, 1);
    }
    window[cacheKey].unshift({ id: data.id, result: data });
    window[cacheKey] = window[cacheKey].slice(0, cacheLength);
  }
};

/**
 * 通用get
 */
export const getResultCache = (id: number | string) => {
  if (Array.isArray(window[cacheKey])) {
    return window[cacheKey].find((item) => item.id === id)?.result;
  }
  return null;
};

/**
 * 注意这个方法非通用
 */
// 仅更新result 中的 result
export const updateResultCache = (id: any, data: any) => {
  if (Array.isArray(window[cacheKey])) {
    const existItem = window[cacheKey].find((item) => item.id === id)?.result;
    if (existItem) {
      existItem.result = data;
    }
  }
};

/**
 * 通用update
 */
export const updateDataCache = (id: any, data: any) => {
  if (Array.isArray(window[cacheKey])) {
    const existItem = window[cacheKey].find((item) => item.id === id);
    if (existItem) {
      existItem.result = data;
    }
  }
};
