import { useEffect, useState } from 'react';
import classNames from 'classnames';
import * as UTIF from 'utif';
import request from '@/utils/request';
import type { IFile } from '../Index';

interface TiffToImageProp extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: any;
  currentFile?: IFile;
  setImgTotal?: React.Dispatch<React.SetStateAction<number>>;
  getImgRef?: (ref: any) => any;
  onConvertLoad?: (e: any) => void;
}

function TiffToImage({
  fallback,
  className,
  getImgRef,
  currentFile,
  onConvertLoad,
  ...rest
}: TiffToImageProp) {
  const [imgSrc, setImgSrc] = useState<string>();

  useEffect(() => {
    if (currentFile?.url) {
      convertHandle(currentFile.url);
    } else {
      setImgSrc(undefined);
    }
  }, [currentFile?.url]);

  function tiffToPng(blob: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const buffer = reader.result as ArrayBuffer;
          const ifds = UTIF.decode(buffer); // 解码 TIFF 文件的 IFDs（图像文件目录）
          const firstPage = ifds[0];
          UTIF.decodeImage(buffer, firstPage);
          const rgba = UTIF.toRGBA8(firstPage); // 解码图像数据
          const canvas = document.createElement('canvas');
          canvas.width = firstPage.width;
          canvas.height = firstPage.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject();
            return;
          }
          const imageData = ctx.createImageData(firstPage.width, firstPage.height);
          imageData.data.set(rgba);
          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob(resolve);
        } catch (error) {
          console.log('tiff to png error', error);
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

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
      const file: Blob = await request(url, { prefix: '', responseType: 'arrayBuffer' });
      const blob = new Blob([file.slice(0, file.size)], { type: 'image/tiff' });
      const imgBlob = await tiffToPng(blob);
      const imgUrl = URL.createObjectURL(imgBlob as Blob);
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

export default TiffToImage;
