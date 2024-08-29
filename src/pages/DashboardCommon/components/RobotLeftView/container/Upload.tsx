import { useSelector } from 'dva';
import type { ConnectState } from '@/models/connect';
import Upload from '../components/Upload/Index';
import { formatListContainer } from '../store';

export default () => {
  const { formatList } = formatListContainer.useContainer();
  const { acceptInfo } = useSelector((state: ConnectState) => state.Robot);
  return <Upload accept={acceptInfo?.accept} getList={formatList} />;
};
