import { forwardRef, useEffect, useMemo } from 'react';
import { getFileNameAndType } from '@/utils';
import type { IFile } from '../Index';
import PDFToImage from '../PDFToImage';
import OFDToImage from '../OFDToImage';
import TiffToImage from '../TiffToImage';

interface ImageFormatViewProp extends Record<string, any> {
  currentFile: Omit<IFile, 'status'> & { status: any; url: string };
}

function ImageFormatViewComponent({ currentFile, ...rest }: ImageFormatViewProp, ref: any) {
  const { isPDF, isOFD, isTiff } = useMemo(() => {
    const { type } = getFileNameAndType(currentFile?.name || '');
    if (['pdf', 'doc', 'docx'].includes(type) || currentFile?.isPDF) {
      return { isPDF: true };
    } else if (['ofd'].includes(type)) {
      return { isOFD: true };
    } else if (['tif', 'tiff'].includes(type)) {
      return { isTiff: true };
    }
    return {};
  }, [currentFile?.name]);

  // 重新识别刷新结果
  const refresh = (currentFile as any).t;
  useEffect(() => {
    if (refresh && rest.onLoad) {
      rest.onLoad();
    }
  }, [refresh]);

  if (isPDF) {
    return <PDFToImage currentFile={currentFile} {...rest} getImgRef={ref} />;
  }

  if (isOFD) {
    return <OFDToImage currentFile={currentFile} {...rest} getImgRef={ref} />;
  }

  if (isTiff) {
    return <TiffToImage currentFile={currentFile} {...rest} getImgRef={ref} />;
  }

  return <img {...rest} ref={ref} />;
}

export const ImageFormatView = forwardRef(ImageFormatViewComponent);
