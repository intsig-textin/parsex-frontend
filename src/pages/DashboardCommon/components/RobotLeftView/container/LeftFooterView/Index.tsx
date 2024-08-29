import type { FC } from 'react';
import { Button, Checkbox } from 'antd';
import { fileContainer } from '../../store';
import styles from '../Index.less';

const FooterView: FC = function (props) {
  const {
    rowSelected,
    isSelectAll,
    selectFiles,
    handleMultipleClick,
    handleCheckChange,
    setIndeterminate,
    indeterminate,
  } = fileContainer.useContainer();

  return (
    <div className={styles.leftBarFooter}>
      {rowSelected && (
        <div className={styles.checkRow}>
          <Checkbox
            checked={isSelectAll}
            onChange={(e) => {
              handleCheckChange(e.target.checked);
              setIndeterminate(false);
            }}
            indeterminate={indeterminate}
          >
            <span style={{ color: '#3A415C' }}>本页全选</span>
          </Checkbox>
          <div className={styles.text}>
            已选择
            <span style={{ color: '#1A66FF', margin: '0 3px' }}>{selectFiles.length}</span>
            个文件
          </div>
        </div>
      )}
      {/* 识别按钮 */}
      <div className={styles.buttonArea}>
        <Button type="link" onClick={handleMultipleClick} className={styles.linkBtn}>
          {rowSelected ? '退出多选' : '多选'}
        </Button>
        {props.children}
      </div>
    </div>
  );
};

export default FooterView;
