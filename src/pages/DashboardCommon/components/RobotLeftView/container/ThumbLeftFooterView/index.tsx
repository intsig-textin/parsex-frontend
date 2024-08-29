import type { FC } from 'react';
import { Checkbox, Badge } from 'antd';
import { fileContainer } from '../../store';
import styles from './index.less';

const ThumbLeftFooterView: FC = function (props) {
  const {
    rowSelected,
    isSelectAll,
    selectFiles,
    // handleMultipleClick,
    handleCheckChange,
    indeterminate,
    setIndeterminate,
  } = fileContainer.useContainer();
  // className={classNames({
  //     [styles.selected]:!isSelectAll &&  selectFiles.length>0
  // })}

  return (
    <div className={styles.leftBarFooter}>
      {rowSelected && (
        <div className={styles.checkRow}>
          <Checkbox
            indeterminate={indeterminate}
            checked={isSelectAll}
            onChange={(e) => {
              handleCheckChange(e.target.checked);
              setIndeterminate(false);
            }}
          >
            <Badge className={styles.badge} count={selectFiles.length} offset={[15, 7]}>
              <span style={{ color: '#3A415C' }}>全选</span>
            </Badge>
          </Checkbox>
          {/* <div className={styles.text}>
            已选择
            <span style={{ color: '#4877FF' }}>{selectFiles.length}</span>
            个文件
          </div> */}
        </div>
      )}
      {/* 识别按钮 */}
      <div className={styles.buttonArea}>
        {/* <div onClick={handleMultipleClick} className={styles.linkBtn}>
          {rowSelected ? '退出多选' : '多选'}
        </div> */}
        <div style={{ marginTop: 32 }}>{props.children}</div>
      </div>
    </div>
  );
};

export default ThumbLeftFooterView;
