// import { useState } from 'react';
// import { CloseOutlined } from '@ant-design/icons';
import styles from './TipsBanner.less';
import classNames from 'classnames';

const TipsBanner = ({ className, text }: { className?: string; text: string }) => {
  // const [show, setShow] = useState(true);

  // if (!show) {
  //   return null;
  // }

  if (!text) return null;

  return (
    <div className={classNames(styles.tipsBanner, className)}>
      <div className={styles.tipsText}>{text}</div>
      {/* <CloseOutlined className={styles.closeIcon} onClick={() => setShow(false)} /> */}
    </div>
  );
};

export default TipsBanner;
