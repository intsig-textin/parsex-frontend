import classNames from 'classnames';
import { LoadingOutlined } from '@ant-design/icons';
import type { IFileItem } from '@/pages/DashboardCommon/components/RobotLeftView/data.d';
import styles from './Index.less';
import { ReactComponent as WaringCircle } from '@/assets/icon/dashbord/warning.svg';
import { ReactComponent as Clock } from '@/assets/icon/dashbord/clock.svg';
const primaryColor = { color: '#4877ff' };

export function FileStatus({
  status,
  className,
}: {
  status: IFileItem['status'];
  className?: string;
  name?: string;
}) {
  if (status === 'wait' || status === 'timeout') {
    return (
      <div className={classNames(styles.fileStatusWait, className)}>
        {/* <Loading3QuartersOutlined size={12} /> */}
        <WaringCircle className="warning-icon" />
        {/* <img src={rotate} width={16} height={16} style={{ marginRight: 8 }} /> */}
      </div>
    );
  }
  if (status === 'queue') {
    return (
      <div className={className}>
        <Clock className="waiting-icon" />
      </div>
    );
  }
  if (status === 'complete') {
    return <></>;
  }
  return (
    <div className={classNames(styles.fileStatusUpload, className)}>
      <LoadingOutlined style={primaryColor} />
    </div>
  );
}
