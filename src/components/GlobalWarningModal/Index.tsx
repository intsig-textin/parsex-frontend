import React from 'react';
import { Modal } from 'antd';
import attention from '@/assets/icon/warning.svg';
import styles from './Index.less';

interface GlobalWarningModalProps {
  visible: boolean;
  title: string;
  desc?: string;
  onClick: () => void;
}

const GlobalWarningModal: React.FC<GlobalWarningModalProps> = (props) => {
  const { visible, title, desc, onClick } = props;

  return (
    <div>
      <Modal
        className={styles.confirmModal}
        centered
        visible={visible}
        footer={null}
        closable={false}
        width={'420px'}
      >
        <div className={styles.title}>
          <img
            src={attention}
            style={{
              width: '24px',
            }}
          />
          <span>{title}</span>
        </div>
        {desc && <div className={styles.desc}>{desc}</div>}
        <div className={styles.btnWrapper}>
          <span className={styles.btnConfirm} onClick={onClick}>
            <span>刷新页面</span>
          </span>
        </div>
      </Modal>
    </div>
  );
};

export default GlobalWarningModal;
