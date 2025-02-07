import { useEffect } from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';
import type { ConnectState, IRobotModelState } from '@/models/connect';
import styles from './GoBack.less';
import { useDocumentVisibility } from 'ahooks';
import { textinDomain } from '@/utils/helper';

export interface IProps {
  Robot: IRobotModelState;
  dispatch: Dispatch;
  showAPI?: boolean; // API文档
  showPrice?: boolean; // 查看价格
}

const RobotHeader = (props: IProps) => {
  const {
    Robot: {
      info: { name, service = '' },
      uploadEnd,
    },
    showAPI = true,
  } = props;

  const documentVisibility = useDocumentVisibility();

  useEffect(() => {
    document.title = `TextIn - ParseX`;
  }, [name]);

  useEffect(() => {}, [service, documentVisibility]);

  useEffect(() => {}, [uploadEnd]);

  const handleClick = () => {
    if (service) {
      window.open(`${textinDomain}/document/${service}`);
    }
  };

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

const robotState = ({ Robot }: ConnectState) => ({
  Robot,
});
export default connect(robotState)(RobotHeader);
