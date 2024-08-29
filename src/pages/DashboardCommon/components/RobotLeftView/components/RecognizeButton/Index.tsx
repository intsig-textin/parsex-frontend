import classNames from 'classnames';
import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { useSelector } from 'dva';
import type { ConnectState } from '@/models/connect';
import { listContainer, fileContainer, formatListContainer } from '../../store';
import styles from './Index.less';

interface IRcognizeButtonProp {
  // 当前单击的文件
  currentFile: any;
  // 更新文件识别状态
  updateFileStatus?: () => void;
}

const RecognizeButton = ({ currentFile }: IRcognizeButtonProp) => {
  const { selectFiles } = fileContainer.useContainer();
  const { list: currentList } = listContainer.useContainer();
  const { handleReRecognize, handleReRecognizeExample } = formatListContainer.useContainer();
  const { common, robotInfo } = useSelector((state: ConnectState) => ({
    common: state.Common,
    robotInfo: state.Robot.info,
  }));

  const [disableOcrBtn, setDisableOcrBtn] = useState(false);

  useEffect(() => {
    // 如果没有选中文件(单击、多选)，则不能进行重新识别
    if (currentFile.id || selectFiles.length) {
      setDisableOcrBtn(false);
    } else {
      setDisableOcrBtn(true);
    }
  }, [selectFiles, currentFile, currentList]);

  // 执行重新识别
  const executeFileOcr = () => {
    // 单击列表
    if (selectFiles.length === 0 && currentFile) {
      if (currentFile.isExample) {
        handleReRecognizeExample(currentFile.id);
      } else {
        handleReRecognize([currentFile.id], 'ocr');
      }
    } else {
      const resultKeys: any = [];
      selectFiles.forEach((file) => {
        resultKeys.push(file.id);
      });
      // 多选后再识别，直接抛出选择的keys
      handleReRecognize(resultKeys, 'ocr');
    }
  };

  const disabled = disableOcrBtn || common.resultLoading;

  return (
    <div className={styles.recognizeButtonWrapper}>
      <Button
        className={classNames(styles.ocrButton, {
          [styles.ocrButtonDisable]: disabled,
        })}
        onClick={() => {
          executeFileOcr();
        }}
        disabled={disabled}
      >
        重新识别
      </Button>
    </div>
  );
};

export default RecognizeButton;
