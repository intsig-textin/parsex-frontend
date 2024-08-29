/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Upload, Button, message } from 'antd';
import type { RcFile } from 'antd/lib/upload/interface';
import { useLocation } from 'umi';

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
  accept?: string;
  onUpload: (file: RcFile[]) => void;
  multiple?: boolean; // 是否支持多选
  maxUploadNum?: number;
  children?: ReactElement;
}

export default ({ onUpload, multiple = true, accept, children, maxUploadNum = 50 }: IProps) => {
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const {
    query: { service },
  } = useLocation() as any;

  // const isNeedTypes = ROBOT_NEED_FILETYPES_SERVICE.includes(service);
  // const addToFileTypes = useMemo(() => (isNeedTypes ? ['ofd'] : []), [service]);

  const handleReq = (file: RcFile) => {
    // const type = file.type === '' ? file.name.split('.')[1] : file.type;
    // if (!validImgFileType(type, addToFileTypes)) {
    //   message.warn('请上传jpg/png/bmp格式的图片');
    //   return false;
    // }
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

  const props = {
    ...uploadProps,
    multiple,
    accept: '.png,.jpg,.jpeg,.pdf',
  };
  return (
    <>
      <Upload {...props} accept={accept || props.accept} beforeUpload={handleReq}>
        {!children && (
          <Button className="textin-btn-upload" type="primary" ghost onClick={() => {}}>
            <PlusOutlined /> 上传图片
          </Button>
        )}
        {children}
      </Upload>
    </>
  );
};
