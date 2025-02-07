import { useSelector } from 'dva';
import type { ConnectState } from '@/models/connect';
import styles from './Index.less';
import type { FC } from 'react';
import classNames from 'classnames';
interface FileListHeaderProps {
  className?: string;
}
const FileListHeader: FC<FileListHeaderProps> = ({ className }) => {
  const { fileSaveFlag } = useSelector((store: ConnectState) => ({
    fileSaveFlag: false,
  }));

  return (
    <div className={classNames(styles.titleWrap, className, 'robot_tour_step_2')}>
      <span className={styles.title}>
        <span style={{ paddingRight: 8 }}>{fileSaveFlag ? '我的文件' : '临时文件'}</span>
      </span>
    </div>
  );
};

export default FileListHeader;
