import React from 'react';
import { Image } from 'antd';
import tipImg from '@/assets/list_icon/pic_non_data@2x.png';
import styles from './Index.less';

interface IProps {
  containerHeight?: number | string;
  imgWidth?: number;
  imgHeight?: number;
  src?: string;
  title?: string | React.ReactElement;
  desc?: string | React.ReactElement;
}

const Empty: React.FC<IProps> = ({
  src = tipImg,
  imgWidth,
  imgHeight,
  title = '暂未有任何数据',
  desc,
  containerHeight = 'auto',
}) => {
  return (
    <div
      className={styles.emptyWrap}
      style={{
        height: typeof containerHeight === 'string' ? containerHeight : containerHeight - 20,
      }}
    >
      <Image src={src} width={imgWidth || 88} height={imgHeight || 88} preview={false} />
      {title && <div className={styles.title}>{title}</div>}
      {desc && <div className={styles.desc}>{desc}</div>}
    </div>
  );
};
export default Empty;
