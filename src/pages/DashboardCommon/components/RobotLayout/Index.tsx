import { useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import type { Dispatch } from 'umi';
import { connect } from 'umi';
import classNames from 'classnames';
import type { ConnectState } from '@/models/connect';
import useUploadFormat from '../RobotLeftView/store/useUploadFormat';
import useMathJaxLoad from '../../RobotMarkdown/MathJaxRender/useMathJaxLoad';
import styles from './Index.less';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface IProps {
  leftView: React.ReactNode;
  showCollapsed?: boolean;
  autoCollapsed?: any;
  catalogView?: React.ReactNode;
  mainView: React.ReactNode;
  rightView?: React.ReactNode;
  curRobot: Record<string, any>;
  resizable?: boolean;
  dispatch: Dispatch;
}
const RobotLayout: React.FC<IProps> = ({
  leftView,
  catalogView,
  mainView,
  rightView,
  showCollapsed,
  autoCollapsed,
  curRobot,
  resizable = true,
  dispatch,
}) => {
  const { collapsed, setCollapsed } = useUploadFormat.useContainer();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    dispatch({
      type: 'Robot/getRobotInfo',
      payload: { service: curRobot?.service },
    });
  }, []);

  // 初始化公式渲染插件
  useMathJaxLoad({
    show:
      [16].includes(curRobot?.interaction as number) ||
      ['professional-document-parse', 'pdf_to_markdown'].includes(curRobot?.service as string),
  });

  useEffect(() => {
    if (autoCollapsed) {
      setCollapsed(true);
    }
  }, [autoCollapsed]);

  const onCollapsedHandle = () => {
    setCollapsed((pre) => !pre);
  };

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
          <div
            onClick={onCollapsedHandle}
            className={classNames(styles.collapsedBar, {
              [styles['collapsedBar-width-text']]: collapsed,
            })}
          >
            {collapsed ? (
              <span className={styles.collapsedBarText}>
                <span className={styles['collapsed-text']}>继续上传</span>
                <RightOutlined />
              </span>
            ) : (
              <span className={styles.collapsedBarText}>
                <LeftOutlined />
              </span>
            )}
          </div>
        ) : (
          ''
        )}
      </Col>
      {catalogView && <Col>{catalogView}</Col>}
      {!resizable && (
        <>
          <Col
            className={classNames(styles.mainContent, 'mainViewContainer', {
              mainViewCollapsed: collapsed,
            })}
            style={{ zIndex: 1 }}
          >
            {mainView}
          </Col>
          {rightView && (
            <Col className={styles.rightBar} data-tut="robot-rightContent">
              {rightView}
            </Col>
          )}
        </>
      )}
      {resizable &&
        (rightView ? (
          <>
            <PanelGroup direction="horizontal" style={{ zIndex: 1 }}>
              <Panel minSize={30} maxSize={60}>
                <Col
                  className={classNames(styles.mainContent, 'mainViewContainer', {
                    mainViewCollapsed: collapsed,
                  })}
                >
                  {mainView}
                </Col>
              </Panel>
              <PanelResizeHandle
                title="调整边栏宽度"
                className={classNames(styles.resizeHandle, {
                  [styles.resizeHandleActive]: isDragging,
                })}
                onDragging={(isDragging: boolean) => {
                  setIsDragging(isDragging);
                }}
              />
              <Panel minSize={30} maxSize={70}>
                <Col className={styles.rightBar} data-tut="robot-rightContent">
                  {rightView}
                </Col>
              </Panel>
            </PanelGroup>
          </>
        ) : (
          <Col
            className={classNames(styles.mainContent, 'mainViewContainer', {
              mainViewCollapsed: collapsed,
            })}
            style={{ zIndex: 1 }}
          >
            {mainView}
          </Col>
        ))}
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
