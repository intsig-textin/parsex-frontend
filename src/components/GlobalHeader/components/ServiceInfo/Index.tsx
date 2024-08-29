import React, { useState } from 'react';
import iconDefault from './assets/icon_service_default.png';
import iconHover from './assets/icon_service_hover.png';
import arrow from './assets/arrow.png';
import styles from './Index.less';
import Card from './card/Index';

const ServiceInfo = () => {
  const [ishover, setIshover] = useState(false);
  return (
    <div
      className={styles.container}
      onMouseEnter={() => {
        setIshover(true);
      }}
      onMouseLeave={() => {
        setIshover(false);
      }}
    >
      <img
        src={ishover ? iconHover : iconDefault}
        style={{
          width: '20px',
        }}
      />
      <div className={styles.bottom} style={ishover ? {} : { display: 'none' }}>
        <div className={styles.cardWrapper}>
          <div className={styles.arrow}>
            <img
              src={arrow}
              style={{
                width: '14px',
                height: '7px',
              }}
            />
          </div>
          <Card />
        </div>
      </div>
    </div>
  );
};

export { ServiceInfo };
