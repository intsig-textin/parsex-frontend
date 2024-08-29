import UploadFile from '@/components/Upload/Index';
import { formatListContainer } from '../../store';
import { Button } from 'antd';
//import upload from '@/assets/robot/ic_pic_upload.png';
import { ReactComponent as UploadIcon } from '@/assets/robot/cloud-upload.svg';
import { useSelector } from 'dva';
import type { ConnectState } from '@/models/connect';
export default function Index() {
  const { formatList } = formatListContainer.useContainer();
  const { acceptInfo } = useSelector((state: ConnectState) => state.Robot);
  return (
    <UploadFile accept={acceptInfo?.accept} onUpload={formatList}>
      <Button className="uploadBtn">
        <UploadIcon className="upload_icon" />
        上传文件
      </Button>
    </UploadFile>
  );
}
