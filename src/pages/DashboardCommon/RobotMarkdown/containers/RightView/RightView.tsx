import classNames from 'classnames';
import type { FC, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Radio } from 'antd';
import ReactJson from 'react-json-view';
import lodash from 'lodash';
import { connect } from 'umi';
import type { ConnectState } from '@/models/connect';
import Loading from '@/components/Loading';
import styles from './index.less';

enum ResultType {
  json = 'json',
  md = 'md',
  table = 'table',
  image = 'image',
  formula = 'formula',
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
  [ResultType.md]: 'Markdown结果',
  [ResultType.table]: '表格',
  [ResultType.image]: '图片',
  [ResultType.formula]: '公式',
  [ResultType.json]: '原始JSON',
};
const RightContainer: FC<IProps> = ({
  renderFooter,
  onTabChange,
  children,
  wrapperClassName,
  result,
  Common,
  Robot,
}) => {
  const [resultType, setResultType] = useState<ResultType>(ResultType.md);
  const { resultLoading } = Common;

  const options = useMemo(() => {
    return [
      ResultType.md,
      ResultType.table,
      ResultType.formula,
      ResultType.image,
      ResultType.json,
    ].map((item) => ({
      label: tabMap[item],
      value: item,
    }));
  }, []);

  const showJSON = useMemo(() => {
    if (!result) return {};
    return lodash.omit(result, ['dpi', 'catalog', 'pages']);
  }, [result]);

  const handleChangeTab = (e: any) => {
    const type = e.target.value;
    setResultType(type);
    if (onTabChange) {
      onTabChange(type);
    }
  };

  const renderContent = () => {
    if (resultLoading) {
      return <Loading type="normal" />;
    }
    if (resultType === ResultType.json) {
      return (
        <div className={classNames(styles.contentWrapper, styles.jsonViewWrapper)}>
          <ReactJson
            src={showJSON}
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
        </div>
      );
    }
    return (
      <div className={classNames(styles.contentWrapper, 'result-content-body')}>{children}</div>
    );
  };

  return (
    <>
      <div
        className={classNames(
          'robotResultTabContainer',
          'tour_step_2',
          wrapperClassName,
          styles.rightContainer,
        )}
      >
        <Radio.Group
          className={styles.radioBtnGroup}
          value={resultType}
          optionType="button"
          buttonStyle="solid"
          onChange={handleChangeTab}
          options={options}
        />

        {renderContent()}
      </div>

      {renderFooter(resultType)}
    </>
  );
};

export default connect((state: ConnectState) => state)(RightContainer);
