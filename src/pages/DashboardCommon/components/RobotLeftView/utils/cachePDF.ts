const cacheKey = 'pdfFileCache';

export const getPDFFromCacheByUrl = (keys?: any[]) => {
  const result: File[] = [];
  if (window[cacheKey]?.blobMap && Array.isArray(keys)) {
    keys.forEach((key, index) => {
      if (window[cacheKey].blobMap[key]) {
        result[index] = window[cacheKey].blobMap[key] as File;
      } else {
        console.warn(`pdfFileCache[${key}] not found`);
      }
    });
  } else {
    console.warn('pdfFileCache empty');
  }
  return result;
};

export const getPDFCache = (key: any) => {
  return window[cacheKey]?.blobMap?.[key];
};

export const setPDFCache = (key: any, file: File) => {
  if (!window[cacheKey]?.blobMap) {
    window[cacheKey] = {
      blobMap: {},
    };
  }
  window[cacheKey].blobMap[key] = file;
};
