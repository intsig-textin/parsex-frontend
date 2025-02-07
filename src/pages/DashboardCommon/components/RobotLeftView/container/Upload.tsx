import { useSelector } from 'dva';
import type { ConnectState } from '@/models/connect';
import type { IProps as UploadProps } from '../components/Upload/Index';
import Upload from '../components/Upload/Index';
import { formatListContainer } from '../store';

export default (props: UploadProps) => {
  const { formatList } = formatListContainer.useContainer();
  const { acceptInfo } = useSelector((state: ConnectState) => state.Robot);
  return <Upload {...props} accept={acceptInfo?.accept} getList={formatList} />;
};
