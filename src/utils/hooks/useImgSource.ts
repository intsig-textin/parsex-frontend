import { requestWidthCache } from '@/utils';
import { useEffect, useState } from 'react';
import pQueue from 'p-queue';
import { isThumbnailId } from '@/pages/DashboardCommon/components/RobotLeftView/utils/convertFileItem';
import { downloadOcrImg } from '@/services/robot';

window.imgSourceQueue = new pQueue({ concurrency: 2, autoStart: false });

const useImgSource = (
  url?: string,
  {
    defaultUrl,
    noDownload,
    priority,
  }: { defaultUrl?: string; noDownload?: boolean; priority?: number } = {},
) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(defaultUrl);

  useEffect(() => {
    if (url) {
      if (typeof priority === 'number') {
        window.imgSourceQueue.add(
          async () => {
            await queryFile();
          },
          { priority },
        );
      } else {
        queryFile();
      }
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
      if (isThumbnailId(url)) {
        const { data } = await downloadOcrImg(url);
        setImgSrc('data:image/jpeg;base64,' + data?.image);
        return;
      }
      const imgBlob = await requestWidthCache(url, { ...options, noMessage: true });
      if (imgBlob.type?.includes('application/json')) {
        // console.log(imgBlob);
        //请求失败1s后重新请求
        setTimeout(async () => {
          const retryBlob = await requestWidthCache(url, options);
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
