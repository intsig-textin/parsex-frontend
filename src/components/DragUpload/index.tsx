/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import Restultimg from '@/assets/robot/Restultimg.png';
import { Upload, message } from 'antd';
import type { RcFile } from 'antd/lib/upload/interface';
import styles from './index.less';
import classNames from 'classnames';
import usePaste from '../GlobalDragUpload/usePaste';

const { Dragger } = Upload;
const uploadProps = {
  accept: 'image/*',
  fileList: [],
  multiple: true,
  showUploadList: false,
};

/**
 * 需要设置特殊的文件类型
 */
// const ROBOT_NEED_FILETYPES_SERVICE = ['vat_invoice', 'bills_crop'];

export interface IProps {
  onUpload: (file: RcFile[]) => void;
  multiple?: boolean; // 是否支持多选
  maxUploadNum?: number;
  children?: ReactElement;
  desc?: string;
  accept?: string;
  acceptDesc?: string;
  size?: number;
  noPaste?: boolean;
}

export default ({
  onUpload,
  multiple = true,
  children,
  maxUploadNum = 50,
  desc,
  noPaste,
  ...rest
}: IProps) => {
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const handleReq = (file: RcFile) => {
    setFileList((fileList) => [...fileList, file]);
    return false;
  };

  useEffect(() => {
    if (fileList.length < 1) return;
    if (fileList.length > maxUploadNum) {
      message.warn('单次批量上传最多50张');
    }
    onUpload(fileList.slice(0, maxUploadNum));
    setFileList([]);
  }, [fileList]);

  // ctrl v
  usePaste({
    onPaste: (fileList) => {
      if (noPaste) return;
      if (fileList.length < 1) return;
      if (fileList.length > maxUploadNum) {
        message.warn(`单次批量上传最多${maxUploadNum}张`);
      }
      onUpload(fileList.slice(0, maxUploadNum));
    },
  });

  const props = {
    ...uploadProps,
    multiple,
    accept: '.png,.jpg,.jpeg,.pdf,.tif,.tiff',
  };
  const accept = rest.accept || props.accept;
  const acceptDesc = rest.acceptDesc || accept?.replace(/\./g, ' ');
  return (
    <div className={styles.drag_upload}>
      <Dragger
        {...props}
        accept={accept}
        beforeUpload={handleReq}
        className={classNames(styles.upload_container)}
      >
        {!children && (
          <div className={styles.drag_upload_wrapper}>
            <div className={styles.image_wrapper}>
              <img src={Restultimg} alt="" />
            </div>
            <div className={styles.action_guide}>点击上传文件 / 拖拽文件到此处 / 截图后ctrl+v</div>
            <div className={styles.desc}>
              {!desc && (
                <div>
                  <div>
                    {/(支持|格式)/.test(acceptDesc)
                      ? acceptDesc.replace(/[,.。]$/, '，')
                      : `支持${acceptDesc}等格式，`}
                  </div>
                  <div>上传单个文件大小不超过{rest.size || 10}M</div>
                </div>
              )}
            </div>
          </div>
        )}
        {children}
      </Dragger>
    </div>
  );
};
