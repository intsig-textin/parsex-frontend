import classNames from 'classnames';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { Tabs } from 'antd';
import ReactJson from 'react-json-view';
import styles from './Index.less';
import { connect } from 'umi';
import type { ConnectState } from '@/models/connect';
import Loading from '@/components/Loading';
enum ResultType {
  json = 'json',
  text = 'text',
}

export { ResultType };

interface IProps {
  renderFooter: (curType: ResultType) => ReactNode;
  onTabChange?: (curType: ResultType) => void;
  resultTabName?: string;
  wrapperClassName?: string;
  result: any;
  Common: ConnectState['Common'];
  Robot: ConnectState['Robot'];
  children?: any;
}
const tabMap = {
  [ResultType.text]: '识别结果',
  [ResultType.json]: 'JSON结果',
};
const RightContainer: FC<IProps> = ({
  renderFooter,
  onTabChange,
  resultTabName,
  children,
  wrapperClassName,
  result,
  Common,
  Robot,
}) => {
  const [resultType, setResultType] = useState<ResultType>(ResultType.text);
  const { resultLoading } = Common;

  const handleChangeTab = (type: any) => {
    setResultType(type);
    if (onTabChange) {
      onTabChange(type);
    }
  };

  return (
    <>
      <div
        className={classNames(
          'robotResultTabContainer',
          'tour_step_2',
          'result-content-body',
          wrapperClassName,
          styles.rightContainer,
        )}
      >
        <Tabs
          defaultActiveKey="result"
          activeKey={resultType}
          centered
          // destroyInactiveTabPane
          onChange={handleChangeTab}
        >
          <Tabs.TabPane
            tab={resultTabName ?? tabMap[ResultType.text]}
            key={ResultType.text}
            className="result-text"
          >
            {resultLoading ? <Loading type="normal" /> : children}
          </Tabs.TabPane>
          <Tabs.TabPane tab={tabMap[ResultType.json]} key={ResultType.json}>
            <div className="result-json textin-json-view-panel">
              {resultLoading ? (
                <Loading type="normal" />
              ) : (
                result && (
                  <ReactJson
                    src={result || {}}
                    enableClipboard={false}
                    onEdit={false}
                    name={null}
                    collapsed={3}
                    onAdd={false}
                    style={{
                      fontFamily: 'Monaco, Menlo, Consolas, monospace',
                      color: '#9b0c79',
                    }}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    collapseStringsAfterLength={1000}
                  />
                )
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
      {renderFooter(resultType)}
    </>
  );
};

export default connect((state: ConnectState) => state)(RightContainer);
