import React from 'react';
import type { Actions } from 'ahooks/lib/useBoolean';
import { Modal, Button } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import styles from './Index.less';
import { prefixPath } from '@/utils';

interface ModalProps extends Actions {
  state: boolean;
}

export default ({ ...payModal }: ModalProps) => {
  return (
    <Modal
      visible={payModal.state}
      onCancel={payModal.setFalse}
      centered
      wrapClassName={styles.robotModalWrap}
      maskTransitionName=""
      width={420}
      footer={null}
    >
      <div className="title" style={{ textAlign: 'left' }}>
        <ExclamationCircleFilled style={{ color: '#FFBD1A', marginRight: 8 }} />
        <span>额度不足</span>
      </div>
      <div style={{ marginBottom: 30, marginLeft: 24 }}>机器人免费额度/T币余额不足!</div>
      <div style={{ textAlign: 'right' }}>
        <Button type="primary" ghost onClick={payModal.setFalse}>
          取消
        </Button>
        <Button
          type="primary"
          onClick={() => {
            window.open(`${prefixPath}dashboard/userCenter/charge`, '_blank');
          }}
        >
          去充值
        </Button>
      </div>
    </Modal>
  );
};
