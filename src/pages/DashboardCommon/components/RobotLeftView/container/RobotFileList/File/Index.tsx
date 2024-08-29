import { FileStatus } from '@/components/FileStatus/Index';
import ImgDefault from '@/assets/images/img_loading@2x.png';
import type { IFileItem } from '../../../data';
import { Image } from 'antd';
import classNames from 'classnames';
import styles from './Index.less';
import useImgSource from '@/utils/hooks/useImgSource';
import feeback from '@/assets/images/img_error.svg';
import PDFToImage from '@/pages/DashboardCommon/components/RobotMainView/PDFToImage';
import OFDToImage from '@/pages/DashboardCommon/components/RobotMainView/OFDToImage';
import TiffToImage from '@/pages/DashboardCommon/components/RobotMainView/TiffToImage';
import { useMemo } from 'react';
import { getFileNameAndType } from '@/utils';

type IProps = {
  onClick: (item: Exclude<IFileItem, 'active' | 'status'>) => void;
};

export default ({ onClick, ...props }: IFileItem & IProps) => {
  const { id, name, status, time, active, url, thumbnail, onLoad } = props;

  const { isPDF, isDoc, isOFD, isTiff } = useMemo(() => {
    const { type } = getFileNameAndType(name || '');
    if (['pdf', 'doc', 'docx'].includes(type)) {
      return { isPDF: true, isDoc: ['doc', 'docx'].includes(type) };
    } else if (['ofd'].includes(type)) {
      return { isOFD: true };
    } else if (['tif', 'tiff'].includes(type)) {
      return { isTiff: true };
    }
    return {};
  }, [name]);

  const noImage = isPDF || isOFD || isTiff;
  const imgSrc = useImgSource(noImage ? url : thumbnail, {
    defaultUrl: noImage ? undefined : ImgDefault,
    noDownload: isDoc,
  });

  const handClick = () => {
    onClick(props);
  };

  const contentRender = useMemo(() => {
    const currentFile: any = { url: imgSrc || '', isDoc, imgData: props.imgData };
    return (
      <div className={styles.imgWrapper}>
        {isPDF && (
          <PDFToImage onConvertLoad={onLoad} currentFile={currentFile} fallback={feeback} />
        )}
        {isOFD && (
          <OFDToImage onConvertLoad={onLoad} currentFile={currentFile} fallback={feeback} />
        )}
        {isTiff && (
          <TiffToImage onConvertLoad={onLoad} currentFile={currentFile} fallback={feeback} />
        )}
        {!noImage && <Image src={imgSrc} fallback={feeback} preview={false} />}
      </div>
    );
  }, [imgSrc, isPDF, isDoc, isOFD, isTiff, props.imgData]);

  return (
    <div
      className={classNames(styles.fileItem, {
        [styles.active]: active,
      })}
      key={id}
      onClick={handClick}
    >
      {contentRender}
      <div className={styles.file} title={name}>
        <div className={styles.fileNameWrapper}>
          <FileStatus status={status} className={styles.fileStatus} />
          <div className={styles.fileName}>{name}</div>
        </div>
        <div className={styles.time}>{time}</div>
      </div>
    </div>
  );
};
