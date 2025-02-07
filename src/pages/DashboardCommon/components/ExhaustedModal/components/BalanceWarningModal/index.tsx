import { Button, Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import styles from './index.less';
import ExhaustedModalContainer from '../../store';
import { textinDomain } from '@/utils/helper';

export default () => {
  const { robotInfo } = useSelector((states: ConnectState) => ({
    robotInfo: states.Robot.info,
  }));

  const { balanceWarningModal, setBalanceWarningModal } = ExhaustedModalContainer.useContainer();

  const onClose = () => {
    setBalanceWarningModal({ visible: false });
  };

  return (
    <Modal
      visible={balanceWarningModal.visible}
      onCancel={onClose}
      centered
      wrapClassName={styles.robotModalWrap}
      maskTransitionName=""
      width={420}
      footer={null}
    >
      <div className="title" style={{ textAlign: 'left' }}>
        <ExclamationCircleFilled style={{ color: '#FFBD1A', marginRight: 8 }} />
        <span>提示</span>
      </div>
      <div style={{ marginBottom: 30, marginLeft: 24 }}>当前账号余额不足，请补充套餐！</div>
      <div style={{ textAlign: 'right' }}>
        <Button
          type="primary"
          onClick={() => {
            onClose?.();
            window.open(`${textinDomain}/market/chager/${robotInfo.service}`, '_blank');
          }}
        >
          购买套餐
        </Button>
      </div>
    </Modal>
  );
};
