import classNames from 'classnames';
import type { FC, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Radio, Tooltip, Switch } from 'antd';
import ReactJson from 'react-json-view';
import lodash from 'lodash';
import { connect } from 'umi';
import type { ConnectState } from '@/models/connect';
import markdownSwitchIcon from '@/assets/images/markdown_switch.png';
import Loading, { DotsLoading } from '@/components/Loading';
import styles from './index.less';
import { storeContainer } from '../../../RobotStruct/store';

enum ResultType {
  json = 'json',
  md = 'md',
  table = 'table',
  image = 'image',
  formula = 'formula',
  handwriting = 'handwriting',
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
  [ResultType.handwriting]: '手写',
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

  const {
    showModifiedMarkdown,
    setShowModifiedMarkdown,
    markdownMode,
    showAutoSave,
    autoSaveMarkdown,
    setAutoSaveMarkdown,
    resultJsonSaveLoading,
  } = storeContainer.useContainer();

  const showAutoSaveSwitch = resultType === ResultType.md && showAutoSave;

  const options = useMemo(() => {
    return [
      ResultType.md,
      ResultType.table,
      ResultType.formula,
      ResultType.image,
      ResultType.handwriting,
      ResultType.json,
    ].map((item) => ({
      label: tabMap[item],
      value: item,
    }));
  }, []);

  const showJSON = useMemo(() => {
    if (!result) return {};
    return lodash.omit(result, ['dpi', 'catalog', 'detail_new', 'markdown_new']);
  }, [result]);

  const showMarkdownSwitcher = useMemo(() => {
    return resultType === ResultType.md && result?.detail_new && markdownMode === 'view';
  }, [result, resultType, markdownMode]);

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
        <div className={styles.header}>
          <Radio.Group
            className={styles.radioBtnGroup}
            value={resultType}
            optionType="button"
            buttonStyle="solid"
            onChange={handleChangeTab}
            options={options}
          />
          {showMarkdownSwitcher && (
            <Tooltip
              title={showModifiedMarkdown ? '展示原始识别结果' : '展示最新修改结果'}
              placement="topRight"
            >
              <img
                className={styles.markdownSwitch}
                src={markdownSwitchIcon}
                onClick={() => {
                  setShowModifiedMarkdown(!showModifiedMarkdown);
                }}
              />
            </Tooltip>
          )}
          {showAutoSaveSwitch && (
            <div className={styles.autoSave}>
              <div>
                {resultJsonSaveLoading ? (
                  <span>
                    保存中
                    <DotsLoading />
                  </span>
                ) : (
                  '自动保存'
                )}
              </div>
              <div style={{ width: 8 }} />
              <Switch checked={autoSaveMarkdown} onChange={(value) => setAutoSaveMarkdown(value)} />
            </div>
          )}
        </div>
        {renderContent()}
      </div>

      {renderFooter(resultType)}
    </>
  );
};

export default connect((state: ConnectState) => state)(RightContainer);
