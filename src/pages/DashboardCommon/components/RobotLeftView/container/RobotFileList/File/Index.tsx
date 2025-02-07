import { FileStatus } from '@/components/FileStatus/Index';
// import ImgDefault from '@/assets/images/img_loading@2x.png';
import type { IFileItem } from '../../../data';
import { Image, Popconfirm } from 'antd';
import classNames from 'classnames';
import styles from './Index.less';
import useImgSource from '@/utils/hooks/useImgSource';
import word_icon from '@/assets/robot/word_icon.svg';
import excel_icon from '@/assets/robot/excel_icon.svg';
import ppt_icon from '@/assets/robot/ppt_icon.svg';
import fallback from '@/assets/images/img_error.svg';
import text_icon from '@/assets/icon/icon-txt.svg';
import PDFToImage from '@/pages/DashboardCommon/components/RobotMainView/PDFToImage';
import OFDToImage from '@/pages/DashboardCommon/components/RobotMainView/OFDToImage';
import TiffToImage from '@/pages/DashboardCommon/components/RobotMainView/TiffToImage';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getFileNameAndType } from '@/utils';
import { DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'dva';
import type { ConnectState } from '@/models/connect';
import { useInViewport } from 'ahooks';

type IProps = {
  onClick: (item: Exclude<IFileItem, 'active' | 'status'>) => void;
  onDelete?: (item: Exclude<IFileItem, 'active' | 'status'>) => void;
  priority?: number;
};

export default function FileItem({ onClick, onDelete, canDelete, ...props }: IFileItem & IProps) {
  const { id, name, status, time, active, url, thumbnail, thumbnail_id, onLoad, priority, index } =
    props;

  const [deleteVisible, setDeleteVisible] = useState(false);

  const itemRef = useRef(null);
  const inViewport = useInViewport(itemRef);

  const { fileSaveFlag } = useSelector((state: ConnectState) => ({
    fileSaveFlag: false,
  }));

  const { isPDF, isOFD, isTiff, convertPreview, previewIcon } = useMemo(() => {
    const { type } = getFileNameAndType(name || '');
    if (['pdf'].includes(type)) {
      return { isPDF: true };
    } else if (['ofd'].includes(type)) {
      return { isOFD: true };
    } else if (['tif', 'tiff'].includes(type)) {
      return { isTiff: true };
    }
    const isDoc = ['doc', 'docx'].includes(type);
    const isTxt = ['htm', 'txt'].includes(type) || type.includes('html');
    const isExcel = ['xls', 'xlsx', 'csv'].includes(type);
    const isPPT = ['ppt', 'pptx'].includes(type);
    if (isDoc || isTxt || isExcel || isPPT) {
      let icon;
      if (isDoc) {
        icon = word_icon;
      } else if (isTxt) {
        icon = text_icon;
      } else if (isExcel) {
        icon = excel_icon;
      } else if (isPPT) {
        icon = ppt_icon;
      }
      return { convertPreview: true, previewIcon: icon };
    }
    return {};
  }, [name]);

  const noImage = isPDF || isOFD || isTiff;

  const [src, setSrc] = useState(() => {
    if (index < 5) {
      if (thumbnail_id) return thumbnail_id;
      return noImage ? url : thumbnail;
    }
    return undefined;
  });

  useEffect(() => {
    if (inViewport) {
      if (thumbnail_id) {
        setSrc(thumbnail_id);
      } else {
        setSrc(noImage ? url : thumbnail);
      }
    }
  }, [inViewport, thumbnail_id]);

  const imgSrc = useImgSource(src, {
    // defaultUrl: noImage ? undefined : ImgDefault,
    noDownload: convertPreview && !thumbnail_id,
    priority,
  });

  const handClick = () => {
    onClick(props);
  };

  const contentRender = useMemo(() => {
    const currentFile: any = { url: imgSrc || '', imgData: props.imgData, status };
    if (convertPreview) {
      return (
        <div className={styles.imgWrapper}>
          <Image src={thumbnail_id ? imgSrc : previewIcon} fallback={previewIcon} preview={false} />
        </div>
      );
    }
    return (
      <div className={styles.imgWrapper}>
        {isPDF && (
          <PDFToImage
            onConvertLoad={onLoad}
            currentFile={currentFile}
            fallback={fallback}
            type="cover"
            priority={priority}
          />
        )}
        {isOFD && (
          <OFDToImage onConvertLoad={onLoad} currentFile={currentFile} fallback={fallback} />
        )}
        {isTiff && (
          <TiffToImage onConvertLoad={onLoad} currentFile={currentFile} fallback={fallback} />
        )}
        {!noImage && <Image src={imgSrc} fallback={fallback} preview={false} />}
      </div>
    );
  }, [imgSrc, isPDF, convertPreview, isOFD, isTiff, props.imgData, status]);

  return (
    <div
      className={classNames(styles.fileItem, {
        [styles.active]: active,
      })}
      key={id}
      onClick={handClick}
      ref={itemRef}
    >
      {contentRender}
      <div className={styles.file} title={name}>
        <div className={styles.fileNameWrapper}>
          <FileStatus status={status} className={styles.fileStatus} />
          <div className={styles.fileName}>{name}</div>
        </div>
        <div className={styles.time}>{time}</div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {fileSaveFlag &&
            !!onDelete &&
            (typeof canDelete === 'boolean' ? canDelete : typeof id === 'number') && (
              <Popconfirm
                title="确认要删除选中的文件吗？删除后将无法恢复！"
                overlayClassName="history-popconfirm-style"
                placement="topRight"
                onConfirm={() => {
                  onDelete?.(props);
                }}
                onVisibleChange={(open) => setDeleteVisible(open)}
                arrowPointAtCenter
              >
                <DeleteOutlined
                  className={classNames(styles.delete, { [styles.show]: deleteVisible })}
                  title="删除"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                />
              </Popconfirm>
            )}
        </div>
      </div>
    </div>
  );
}
