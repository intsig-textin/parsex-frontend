import type { IProps as UploadProps } from '@/components/Upload/Index';
import UploadFile from '@/components/Upload/Index';
//import addSmallIcon from '@/assets/icon/addSmall_icon_default@2x.png';
import styles from './Index.less';
import { ReactComponent as UploadIcon } from '@/assets/robot/cloud-upload.svg';
export interface IProps extends Omit<UploadProps, 'onUpload'> {
  uploadName?: string;
  getList: any;
  desc?: string;
}

const Upload = (props: IProps) => {
  const { getList, desc, uploadName = '上传文件' } = props;

  return (
    <div className={styles.robotUpload} data-tut="robot-upload">
      <UploadFile onUpload={getList} {...props}>
        <div className={styles.uploadChildren} onClick={() => {}}>
          <UploadIcon className={styles.upload_icon} />
          <div className={styles.text}>{uploadName}</div>
          <div className={styles.desc}>{desc || '(支持单个/批量上传)'}</div>
        </div>
      </UploadFile>
    </div>
  );
};
export default Upload;
