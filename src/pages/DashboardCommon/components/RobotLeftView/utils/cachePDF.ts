const cacheKey = 'pdfFileCache';

export const getPDFFromCacheByUrl = (urls?: string[]) => {
  const result: File[] = [];
  if (window[cacheKey]?.urlMapBlob && Array.isArray(urls)) {
    urls.forEach((url) => {
      if (window[cacheKey].urlMapBlob[url]) {
        result.push(window[cacheKey].urlMapBlob[url] as File);
      }
    });
  }
  return result;
};

export const getPDFCache = (url: string) => {
  return window[cacheKey]?.urlMapBlob?.[url];
};

export const setPDFCache = (url: string, file: File) => {
  if (!window[cacheKey]?.urlMapBlob) {
    window[cacheKey] = {
      urlMapBlob: {},
    };
  }
  window[cacheKey].urlMapBlob[url] = file;
};
