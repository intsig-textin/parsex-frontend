import pQueue from 'p-queue';
import qs from 'qs';
import { request, requestWidthCache } from '@/utils';

const cacheKey = '_doc_convert_cache';
const cacheLength = 10;

export const setResultCache = (data: any, blob: Blob) => {
  if (data?.id && blob) {
    if (!Array.isArray(window[cacheKey])) {
      window[cacheKey] = [];
    }
    window[cacheKey].unshift({ id: data.id, result: blob });
    window[cacheKey] = window[cacheKey].slice(0, cacheLength);
  }
};

export const getResultCache = (id: number | string) => {
  if (Array.isArray(window[cacheKey])) {
    return window[cacheKey].find((item) => item.id === id)?.result;
  }
  return null;
};

const isDocUrl = (url: string) => /^http.+\.doc[x]?$/i.test(url);

const convertQueue = new pQueue({ concurrency: 1 });

const useConvert = () => {
  const getBlobUrl = async ({
    url,
    imgData,
    isDoc,
  }: {
    url: string;
    imgData?: Blob;
    isDoc?: boolean;
  }): Promise<string | undefined> => {
    if (url && (isDocUrl(url) || isDoc)) {
      return await convertQueue.add(async () => {
        try {
          const cacheData = getResultCache(url);
          if (cacheData) return URL.createObjectURL(cacheData);
          let blob = imgData;
          if (/^blob:/.test(url) && !blob) {
            blob = await requestWidthCache(url, { responseType: 'blob', prefix: '' });
          }
          const convertBlob = await request.post(`/files/doc_convert`, {
            params: { filename: qs.parse(url.split('?').pop()).filename },
            data: blob,
            responseType: 'blob',
            timeout: 1000 * 5,
            noMessage: true,
          });
          const pdfBlob = new Blob([convertBlob.slice(0, convertBlob.size)], {
            type: 'application/pdf',
          });
          setResultCache({ id: url }, pdfBlob);
          return URL.createObjectURL(pdfBlob);
        } catch (error) {
          console.log('word转pdf error', error);
          return '';
        }
      });
    }
    return url;
  };

  return { getBlobUrl };
};

export default useConvert;
