import { Tooltip } from 'antd';
import type { TooltipProps } from 'antd';
import type { FC } from 'react';
import styles from './index.less';
const TextinToolTip: FC<TooltipProps> = (props) => {
  return (
    <Tooltip
      overlayInnerStyle={{
        background: '#2E384D',
      }}
      {...props}
      className={styles.TextinToolTip}
    />
  );
};
export default TextinToolTip;
