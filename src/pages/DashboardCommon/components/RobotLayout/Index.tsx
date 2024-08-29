import { useEffect, useMemo } from 'react';
import { Col, Row } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import classNames from 'classnames';
import type { ConnectState } from '@/models/connect';
import useUploadFormat from '../RobotLeftView/store/useUploadFormat';
import useMathJaxLoad from '../../RobotMarkdown/MathJaxRender/useMathJaxLoad';
import styles from './Index.less';

interface IProps {
  leftView: React.ReactNode;
  showCollapsed?: boolean;
  autoCollapsed?: any;
  mainView: React.ReactNode;
  rightView?: React.ReactNode;
  curRobot: Record<string, any>;
}
const RobotLayout: React.FC<IProps> = ({
  leftView,
  mainView,
  rightView,
  showCollapsed,
  autoCollapsed,
  curRobot,
}) => {
  const { collapsed, setCollapsed } = useUploadFormat.useContainer();

  // 初始化公式渲染插件
  useMathJaxLoad({
    show:
      [16].includes(curRobot?.interaction as number) ||
      ['professional-document-parse', 'pdf_to_markdown'].includes(curRobot?.service as string),
  });

  const showWechatCode = useMemo(() => {
    // 显示群二维码的服务
    if (['watermark-remove'].includes(curRobot?.service)) {
      return { service: curRobot.service };
    }
    return undefined;
  }, [curRobot]);

  useEffect(() => {
    if (autoCollapsed) {
      setCollapsed(true);
    }
  }, [autoCollapsed]);

  return (
    <Row className={styles.container}>
      <Col
        className={classNames(styles.leftBar, 'leftViewContainer', {
          [styles.barCollapsed]: collapsed,
        })}
      >
        <div className={styles.leftBarAnimate}>
          <div className={styles.leftBarContent}>{leftView}</div>
        </div>
        {showCollapsed ? (
          <div onClick={() => setCollapsed((pre) => !pre)} className={styles.collapsedBar}>
            {collapsed ? <RightOutlined title="展开" /> : <LeftOutlined title="收起" />}
          </div>
        ) : (
          ''
        )}
      </Col>
      <Col
        className={classNames(styles.mainContent, 'mainViewContainer', {
          mainViewCollapsed: collapsed,
        })}
      >
        {mainView}
      </Col>
      {rightView && (
        <Col className={styles.rightBar} data-tut="robot-rightContent">
          {rightView}
        </Col>
      )}
    </Row>
  );
};

const RobotViewContainer = (props: any) => (
  <useUploadFormat.Provider initialState={{ curRobot: props?.curRobot }}>
    <RobotLayout {...props} />
  </useUploadFormat.Provider>
);

const mapStateToProps = ({ Robot }: ConnectState) => ({ curRobot: Robot?.info });

export default connect(mapStateToProps)(RobotViewContainer);
