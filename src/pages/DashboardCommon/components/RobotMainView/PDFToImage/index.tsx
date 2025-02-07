import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import pQueue from 'p-queue';
import { requestWidthCache } from '@/utils';
import useLoadPDF from './useLoadPDF';
import useConvert from './useConvert';
import { getParamsSettings } from '../../ParamsSettings/utils';
import styles from './index.less';

window.pdfToImageQueue = new pQueue({ concurrency: 1, autoStart: false });

interface PDFToImageProp extends React.ImgHTMLAttributes<HTMLImageElement> {
  [key: string]: any;
  fallback?: any;
  currentFile?: { [key: string]: any; url: string; isDoc?: boolean };
  setImgTotal?: React.Dispatch<React.SetStateAction<number>>;
  getImgRef?: (ref: any) => any;
  onConvertLoad?: (e: any) => void;
  priority?: number;
  type?: 'cover';
}

/**
 * pdf转图片
 */
function PDFToImage({
  fallback,
  getImgRef,
  currentFile,
  className,
  setImgTotal,
  onConvertLoad,
  priority,
  type,
  ...rest
}: PDFToImageProp) {
  const [imgSrc, setImgSrc] = useState<any>();
  const [status, setStatus] = useState<'no_password'>();

  const promiseRef = useRef<(e: any) => void>();
  const latestFile = useRef(currentFile);
  latestFile.current = currentFile;

  const { pdfLoad, cmapsURL, getParams } = useLoadPDF({
    onError: () => {
      setImgSrc(fallback);
    },
  });

  const { getBlobUrl } = useConvert();

  useEffect(() => {
    if (pdfLoad && latestFile.current?.url) {
      if (typeof priority === 'number') {
        window.pdfToImageQueue.add(
          async () => {
            loadPDF().catch((error) => {
              console.log('PDFToImage error', error);
              setImgSrc(fallback);
            });
            await new Promise((resolve) => {
              setTimeout(() => {
                resolve(true);
              }, 1500);
              promiseRef.current = resolve;
            });
          },
          { priority },
        );
      } else {
        loadPDF();
      }
    }
  }, [currentFile?.url, pdfLoad]);

  useEffect(() => {
    if (status === 'no_password' && getParamsSettings()?.pdf_pwd) {
      loadPDF();
    }
  }, [currentFile?.status]);

  useEffect(() => {
    if (imgSrc) {
      promiseRef.current?.(imgSrc);
    }
  }, [imgSrc]);

  async function loadPDF() {
    if (!latestFile.current?.url) return;
    const fileUrl = await getBlobUrl({ ...latestFile.current });
    if (!fileUrl) {
      setImgSrc(fallback);
      return;
    }
    const file: Blob = await requestWidthCache(fileUrl, { prefix: '', responseType: 'blob' });
    const blob = new Blob([file.slice(0, file.size)], { type: 'application/pdf' });
    onConvertLoad?.({ blob } as any);
    pdfConversion(blob);
  }

  async function pdfConversion(fileData: Blob) {
    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = (window as any).pdfjsWorker;

    const reader = new FileReader();
    reader.readAsArrayBuffer(fileData);
    reader.onload = function (e) {
      const result = new Uint8Array(e.target?.result as any);
      const loadingTask = (window as any).pdfjsLib?.getDocument({
        password: getParamsSettings()?.pdf_pwd,
        data: result,
        cMapUrl: cmapsURL,
        cMapPacked: true,
        isEvalSupported: false,
      });
      loadingTask.promise
        .then((pdf: any) => {
          if (pdf) {
            setImgTotal?.(pdf.numPages);
            openPage(pdf);
          }
        })
        .catch((reason: any) => {
          setImgSrc(fallback);
          console.error('Error: ' + reason);
          if (reason?.name === 'PasswordException') {
            setStatus('no_password');
          }
        });
    };
  }

  function openPage(pdfFile: any, pageNumber = 1) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    let scale = 2.08; // 放大2.08倍，和算法保持一致
    if (type === 'cover') {
      scale = 0.2;
    }

    pdfFile
      .getPage(pageNumber)
      .then((page: any) => {
        const viewport = page.getViewport(getParams(scale));
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        const renderTask = page.render(renderContext);
        renderTask.promise
          .then(() => {
            let quality;
            if (type === 'cover') {
              quality = 0.2;
            }
            const base64ImgSrc = canvas.toDataURL('image/png', quality);
            setImgSrc(base64ImgSrc);
          })
          .catch((err: any) => {
            setImgSrc(fallback);
            console.error('Error: ' + err);
          });
      })
      .catch((err: any) => {
        setImgSrc(fallback);
        console.error('Error: ' + err);
      });
  }

  return (
    <img
      {...rest}
      className={classNames(styles['pdf-image'], className)}
      src={imgSrc}
      ref={getImgRef}
      alt="image"
    />
  );
}

export default PDFToImage;
