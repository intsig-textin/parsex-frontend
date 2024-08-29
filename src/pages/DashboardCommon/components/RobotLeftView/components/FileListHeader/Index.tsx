import { useSelector } from 'dva';
import RobotInfoTile from './RobotSettingInfo';
import type { ConnectState } from '@/models/connect';
import styles from './Index.less';
import type { FC } from 'react';
import classNames from 'classnames';
interface FileListHeaderProps {
  className?: string;
}
const FileListHeader: FC<FileListHeaderProps> = ({ className }) => {
  const { fileSaveFlag } = useSelector((store: ConnectState) => ({
    fileSaveFlag: true,
  }));

  return (
    <div className={classNames(styles.titleWrap, className)}>
      <div className={styles.title}>
        {fileSaveFlag ? (
          '我的文件'
        ) : (
          <>
            临时文件
            <RobotInfoTile />
          </>
        )}
        {/* <>
            临时文件
            <RobotInfoTile />
          </> */}
      </div>
    </div>
  );
};

export default FileListHeader;
