import { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'umi';
import { connect, useLocation } from 'umi';
import type { ConnectState, IRobotModelState, IUserModelState } from '@/models/connect';
import { isFreeRobot } from './constants';
import styles from './GoBack.less';
import { useDocumentVisibility } from 'ahooks';
import { textinDomain } from '@/utils/helper';

export interface IProps {
  Robot: IRobotModelState;
  User: IUserModelState;
  dispatch: Dispatch;
  showAPI?: boolean; // API文档
  showPrice?: boolean; // 查看价格
}

interface ICount {
  count_used: number;
  count_total: number;
  progress?: string;
}

interface IRetry extends ICount {
  retry: number;
}

// 不显示私有化部署的服务
const hiddenDeployBtn = ['verify_vat'];

// 显示群二维码
const showWechatServices = ['watermark-remove'];

const retryTime = 1000;

const RobotHeader = (props: IProps) => {
  const {
    dispatch,
    Robot: {
      info: { name, id, service = '', api_id, publish_time },
      uploadEnd,
    },
    showAPI = true,
    showPrice = true,
  } = props;

  const documentVisibility = useDocumentVisibility();

  const [useCountData, setUseCountData] = useState<ICount>();
  const retryRef = useRef<IRetry>();

  useEffect(() => {
    const { name } = props.Robot.info;

    document.title = `TextIn - ParseX`;
  }, [name]);

  useEffect(() => {}, [service, documentVisibility]);

  useEffect(() => {}, [uploadEnd]);

  const handleClick = () => {
    if (service) {
      window.open(`${textinDomain}/document/${service}`);
    }
  };

  if (isFreeRobot(service)) {
    return (
      <div className={styles.wrapper}>
        <span className={styles.text}>{name}</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* <span className={styles.text}>{name}</span> */}
      {showAPI && (
        <span
          className={styles.apiText}
          onClick={() => {
            handleClick();
          }}
        >
          API文档
        </span>
      )}
    </div>
  );
};

const robotState = ({ Robot, User }: ConnectState) => ({
  Robot,
  User,
});
export default connect(robotState)(RobotHeader);
