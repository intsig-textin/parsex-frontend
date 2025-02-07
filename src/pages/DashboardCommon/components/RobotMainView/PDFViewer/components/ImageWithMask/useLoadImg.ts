import { useEffect, useRef, useState } from 'react';
import PQueue from 'p-queue';
import { downloadOcrImg } from '@/services/robot';

const pQueue = new PQueue({ concurrency: 3 });

const useLoadImg = ({
  page,
  pageNumber,
  pageInfo,
}: {
  page: any;
  pageNumber: number;
  pageInfo: any;
}) => {
  const { url, image_id } = page;
  const [src, setSrc] = useState(url);
  const [status, setStatus] = useState('loading');
  const latestPageInfo = useRef(pageInfo);
  latestPageInfo.current = pageInfo;

  useEffect(() => {
    if (image_id && !src) {
      pQueue.add(async () => {
        try {
          if (Math.abs(latestPageInfo.current?.current - pageNumber) <= 5) {
            const { data, code } = await downloadOcrImg(image_id);
            if (data) {
              setStatus('success');
              setSrc('data:image/jpeg;base64,' + data.image);
            } else {
              setStatus(code === 404 ? 'expired' : 'error');
            }
          }
        } catch (error) {
          setStatus('error');
          console.log('download img error', error);
        }
      });
    }
  }, [image_id, pageInfo]);

  return { src, status };
};

export default useLoadImg;
