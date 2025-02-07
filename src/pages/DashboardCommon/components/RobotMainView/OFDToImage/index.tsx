import { useEffect, useState } from 'react';
import classNames from 'classnames';
import pQueue from 'p-queue';
import { requestWidthCache } from '@/utils';
// import { convertOFD } from '@/services/robot';
import type { IFile } from '../Index';

interface OFDToImageProp extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: any;
  currentFile?: IFile;
  setImgTotal?: React.Dispatch<React.SetStateAction<number>>;
  getImgRef?: (ref: any) => any;
  onConvertLoad?: (e: any) => void;
}

const convertQueue = new pQueue({ concurrency: 1 });

function OFDToImage({
  fallback,
  className,
  getImgRef,
  currentFile,
  onConvertLoad,
  ...rest
}: OFDToImageProp) {
  const [imgSrc, setImgSrc] = useState<string>();

  useEffect(() => {
    if (currentFile?.url) {
      convertQueue.add(async () => {
        await convertHandle(currentFile.url);
      });
    } else {
      setImgSrc(undefined);
    }
  }, [currentFile?.url]);

  async function convertHandle(url: string) {
    if (/^data:/.test(url)) return;
    if (!window.ofdConvertCache) {
      window.ofdConvertCache = {};
    }
    if (window.ofdConvertCache?.[url]) {
      setImgSrc(window.ofdConvertCache[url]);
      return;
    }
    try {
      const file: Blob = await requestWidthCache(url, { prefix: '', responseType: 'blob' });
      const blob = new Blob([file.slice(0, file.size)], { type: 'application/ofd' });
      // const imgBlobRes = await convertOFD(blob);
      const imgBlobRes = blob;
      const imgBlob = new Blob([imgBlobRes.slice(0, imgBlobRes.size)], { type: 'image/jpg' });
      const imgUrl = URL.createObjectURL(imgBlob);
      setImgSrc(imgUrl);
      onConvertLoad?.({ blob: imgBlob } as any);
      window.ofdConvertCache[url] = imgUrl;
    } catch (error) {
      console.log('ofd-to-image-error', error);
      setImgSrc(fallback);
    }
  }

  return (
    <img {...rest} className={classNames(className)} src={imgSrc} ref={getImgRef} alt="image" />
  );
}

export default OFDToImage;
