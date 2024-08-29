const cacheKey = '_result_cache';
const cacheLength = 10;

export const setResultCache = (data: any) => {
  if (data?.id && data?.result) {
    if (!Array.isArray(window[cacheKey])) {
      window[cacheKey] = [];
    }
    window[cacheKey].unshift({ id: data.id, result: data });
    window[cacheKey] = window[cacheKey].slice(0, cacheLength);
  }
};

export const getResultCache = (id: number | string) => {
  if (Array.isArray(window[cacheKey])) {
    return window[cacheKey].find((item) => item.id === id)?.result;
  }
  return null;
};
