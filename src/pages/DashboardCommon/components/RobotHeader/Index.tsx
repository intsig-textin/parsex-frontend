import { useDispatch } from '@/.umi/plugin-dva/exports';
import { useMount, useUnmount } from 'ahooks';
import type { FC, ReactNode } from 'react';
import GoBack from './GoBack';
import type { IProps as IGoBack } from './GoBack';
import styles from './Index.less';

interface RobotHeaderProps {
  extra?: ReactNode;
  goBackProp?: Partial<IGoBack>;
}
const RobotHeader: FC<RobotHeaderProps> = ({ extra, goBackProp }) => {
  const dispatch = useDispatch();

  useMount(() => {
    dispatch({
      type: 'Robot/onUsePage',
    });
  });
  useUnmount(() => {
    dispatch({
      type: 'Robot/clearRobotInfo',
    });
  });
  return (
    <div className={styles.headerContainer}>
      <GoBack {...goBackProp} />
      {extra && <div>{extra}</div>}
    </div>
  );
};

export default RobotHeader;
