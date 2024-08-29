import useImgSource from '@/utils/hooks/useImgSource';
import classNames from 'classnames';
import type { IFileItem } from '@/pages/DashboardCommon/components/RobotLeftView/data.d';
import styles from './Index.less';

interface IProps extends IFileItem {
  onClick: (item: IFileItem) => void;
}
export default function Img({ onClick, className, ...item }: IProps) {
  const imgSrc = useImgSource(item.thumbnail);
  return (
    <div
      className={classNames(styles.img, className)}
      onClick={() => {
        onClick(item);
      }}
      style={{ backgroundImage: `url(${imgSrc})` }}
    />
  );
}
