import type { CSSProperties } from 'react';
import styles from './index.less';

const Scanning = ({ visible }: { visible: boolean }) => {
  return visible ? <div className={styles['origin-image-progress']} /> : null;
};

export const wrapperStyle: CSSProperties = { position: 'relative', overflow: 'hidden' };

export default Scanning;
