import React from 'react';
import { Modal } from 'antd';
import styles from './Index.less';

// 云识别额度不足弹窗
interface OutofLimitPreciousModalProps {
  visible: boolean;
  onCancel: () => void;
  balance: number; // 余额
  cost: number; // 消耗数目
}
export const OutofLimitPreciousModal = ({
  visible,
  onCancel,
  balance,
  cost,
}: OutofLimitPreciousModalProps) => {
  return (
    <Modal
      width={'430px'}
      className={styles.confirmModal}
      style={{
        textAlign: 'center',
      }}
      // 水平垂直居中
      centered={true}
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <div className={styles.confirmTitle}>100%专家识别额度不足</div>
      <div style={{ marginTop: '30px' }} className={styles.confirmDesc}>
        本次消耗：
        <span style={{ color: '#4877ff' }}>{cost}次</span>
        <span style={{ marginLeft: '15px' }}>当前额度剩余：</span>
        <span style={{ color: 'rgba(255, 0, 0, 0.68)' }}>{balance}次</span>
      </div>
      <div style={{ marginTop: '30px' }} className={styles.footerDesc}>
        额度购买功能上架中，敬请期待…
      </div>
    </Modal>
  );
};
