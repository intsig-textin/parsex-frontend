import { request } from '@/utils';
import { useEffect, useState } from 'react';
const useImgSource = (
  url?: string,
  { defaultUrl, noDownload }: { defaultUrl?: string; noDownload?: boolean } = {},
) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(defaultUrl);

  useEffect(() => {
    if (url) {
      queryFile();
    }
    return () => {
      if (imgSrc && url && imgSrc.includes('blob')) URL.revokeObjectURL(imgSrc);
    };
  }, [url]);
  async function queryFile() {
    if (!url) return;
    if (noDownload) {
      setImgSrc(url);
      return;
    }
    const options: Record<string, string> = {
      responseType: 'blob',
    };
    if (url.startsWith('http') || url.startsWith('blob:http')) {
      options.prefix = '';
    }
    try {
      const imgBlob = await request(url, { ...options, noMessage: true });
      if (imgBlob.type?.includes('application/json')) {
        // console.log(imgBlob);
        //请求失败1s后重新请求
        setTimeout(async () => {
          const retryBlob = await request(url, options);
          setImgSrc(URL.createObjectURL(retryBlob));
        }, 1000);

        //  queryFile()
      } else {
        setImgSrc(URL.createObjectURL(imgBlob));
      }

      // eslint-disable-next-line no-empty
    } catch (error) {
      console.log(error);
    }
  }
  return imgSrc;
};

export default useImgSource;
