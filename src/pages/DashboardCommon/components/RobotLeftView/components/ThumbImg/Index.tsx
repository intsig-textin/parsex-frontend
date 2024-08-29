import ImgDefault from '@/assets/images/img_loading@2x.png';
import styles from './Img.less';
import type { IFileItem } from '../../data.d';
import classNames from 'classnames';
import useImgSource from '@/utils/hooks/useImgSource';
import fallback from '@/assets/images/img_error.svg';
import { Image } from 'antd';
import PDFToImage from '../../../RobotMainView/PDFToImage';
import OFDToImage from '../../../RobotMainView/OFDToImage';
interface ImgProps {
  onClick: (item: Exclude<IFileItem, 'active' | 'status'>) => void;
  // 序列号
  number: number;
  isExample?: boolean;
}
export default function ThumbImg({ onClick, active, number, ...props }: ImgProps & IFileItem) {
  const { url, name, thumbnail, isExample } = props;
  const isPDF = /\.pdf$/.test((name || '').toLowerCase());
  const isOFD = /\.ofd$/.test((name || '').toLowerCase());
  const noImage = isPDF || isOFD;
  const imgUrl = useImgSource(noImage ? url : thumbnail, {
    defaultUrl: noImage ? undefined : ImgDefault,
  });

  const handleClick = () => {
    onClick(props);
  };
  const formatNum = (num: number) => {
    return num < 10 ? `0${num}` : num;
  };
  return (
    <div
      className={classNames(styles.thumbImg, {
        [styles.active]: active,
      })}
      onClick={handleClick}
    >
      {isPDF && (
        <PDFToImage currentFile={{ url: imgUrl || '', status: 'wait' }} fallback={fallback} />
      )}
      {isOFD && (
        <OFDToImage currentFile={{ url: imgUrl || '', status: 'wait' }} fallback={fallback} />
      )}
      {!noImage && <Image src={imgUrl} preview={false} fallback={fallback} />}
      {!isExample ? <div className={styles.number}>{formatNum(number)}</div> : null}
    </div>
  );
}
