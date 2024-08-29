import React from 'react';
import { Modal, Button } from 'antd';
import styles from './Index.less';

// 云识别额度充足弹窗
interface ConfirmCloudOcrModalProps {
  visible: boolean;
  onCancel: () => void;
  balance: number; // 余额
  cost: number; // 消耗数目
  executeFileCloudOcr: () => void;
}
export const ConfirmCloudOcrModal = ({
  visible,
  onCancel,
  balance,
  cost,
  executeFileCloudOcr,
}: ConfirmCloudOcrModalProps) => {
  return (
    <Modal
      width={'430px'}
      className={styles.confirmModal}
      // 水平垂直居中
      centered={true}
      visible={visible}
      style={{
        textAlign: 'center',
      }}
      onCancel={onCancel}
      footer={[
        <div style={{ textAlign: 'center' }}>
          <Button
            className={styles.comfirmBtn}
            key="back"
            onClick={onCancel}
            style={{ color: '#4877FF' }}
          >
            取消
          </Button>
          <Button
            key="submit"
            type="primary"
            onClick={executeFileCloudOcr}
            className={styles.comfirmBtn}
            style={{
              marginLeft: '16px',
            }}
          >
            确定
          </Button>
          <div style={{ marginTop: '16px', marginBottom: '14px' }} className={styles.footerDesc}>
            额度购买功能上架中，敬请期待…
          </div>
        </div>,
      ]}
    >
      <div className={styles.confirmTitle}>100%专家识别</div>
      <div style={{ marginTop: '30px' }} className={styles.confirmDesc}>
        本次消耗：
        <span style={{ color: '#4877ff' }}>{cost}次</span>
        <span style={{ marginLeft: '15px' }}>当前额度剩余：</span>
        <span style={{ color: '#4877ff' }}>{balance}次</span>
      </div>
    </Modal>
  );
};
