import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'dva';
import type { IFileItem } from '../../container/RobotFileList/Index';
import type { ConnectState } from '@/models/connect';
import { CROP_VALUE } from '../../constants';
import Img from './Img';
import { fileContainer } from '../../store';
import useUploadFormat from '../../store/useUploadFormat';
import styles from './Index.less';
import { ReactComponent as DownOutlined } from '@/assets/robot/icon-chevrons-down.svg';
import { ReactComponent as UpOutlined } from '@/assets/robot/icon-chevrons-up.svg';
import classNames from 'classnames';
import PDFToImage from '../../../RobotMainView/PDFToImage';
import { getStaticImgURL } from '@/utils';

const DemoWrapper = () => {
  const [demoCollapsed, setDemoCollapsed] = useState(true);
  const [demoList, setDemoList] = useState<IFileItem[]>([]);
  const { curFileActiveId, handleCheckFileClick } = fileContainer.useContainer();
  const { getDefaultUrlParams } = useUploadFormat.useContainer();

  const { Robot, robotInfo, isNew } = useSelector((store: ConnectState) => ({
    Robot: store.Robot,
    robotInfo: store.Robot.info,
    isNew: true,
  }));

  const dispatch = useDispatch();

  useEffect(() => {
    if (Robot.fileFromUrl) {
      const url = getStaticImgURL(Robot.fileFromUrl);
      const row: IFileItem = {
        id: Robot.fileFromUrl,
        name: `样本库-${Robot.fileFromUrl}`,
        url,
        isPDF: url.includes('.pdf') || url.includes('.doc'),
        isDoc: url.includes('.doc'),
        thumbnail: url,
        isExample: true,
        status: 'wait',
      };
      handleCheckFileClick(row);
    }
  }, [Robot.fileFromUrl]);

  useEffect(() => {
    if (!robotInfo.image) return;

    const sampleImageList = robotInfo.image ? robotInfo.image.split('、') : [];
    const displaySampleList = sampleImageList.slice(0, 3);
    const sampleList: IFileItem[] = displaySampleList.map((url: any, index: number) => {
      const item = url.replace(/\.[a-zA-Z]+?$/i, '');
      return {
        id: item.split('filename=')[1],
        name: `样例${index + 1}`,
        url: item,
        isPDF: url.includes('.pdf') || url.includes('.doc'),
        isDoc: url.includes('.doc'),
        thumbnail: `${item}&crop=${CROP_VALUE}`,
        isExample: true,
        status: 'wait',
      };
    });
    setDemoList(sampleList);
    setDemoCollapsed(!!sampleList.length);
  }, [robotInfo.image]);

  // 打开用户指南
  useEffect(() => {
    if (demoList.length && isNew) {
      setTimeout(() => {
        dispatch({
          type: 'Common/toggleHelpGuide',
          payload: true,
        });
      }, 1000);
    }
  }, [demoList]);

  const onPDFLoad = (e: any, index: number) => {
    if (demoList[index] && e.blob) {
      const pdfBlob = new Blob([e.blob.slice(0, e.blob.size)], { type: 'application/pdf' });
      demoList[index].imgData = new File([pdfBlob], demoList[index].url + '.pdf', {
        type: 'application/pdf',
      });
    }
    setDemoList([...demoList]);
  };

  const clickExample = (demo: IFileItem, idx: number) => {
    handleCheckFileClick({ ...demo, queryParams: getDefaultUrlParams(idx) });
  };

  if (!demoList.length) {
    return null;
  }
  return (
    <div className={styles.demoWrapper} data-tut="robot-example">
      <div className={styles.title}>
        <div style={{ flex: 1 }}>
          示例样本 <span className={styles.desc}>*点击样例可查看效果</span>
        </div>
        <div
          className={classNames(styles.collapse_wrapper, 'icon-outlined')}
          onClick={() => setDemoCollapsed(!demoCollapsed)}
        >
          {!demoCollapsed ? <DownOutlined /> : <UpOutlined />}
        </div>
      </div>
      <div className={`${styles.demoImage} ${!demoCollapsed ? 'demo-collapsed' : ''}`}>
        {demoList &&
          demoList.map((demo, idx) => {
            return demo.isPDF ? (
              <div
                key={demo.id}
                className={classNames(styles.img, {
                  [styles.cur_select]: demo.id === curFileActiveId,
                })}
                onClick={() => clickExample(demo, idx)}
              >
                <PDFToImage
                  currentFile={{ url: demo.url, isDoc: demo.isDoc }}
                  onConvertLoad={(e) => onPDFLoad(e, idx)}
                />
              </div>
            ) : (
              <Img
                {...demo}
                key={demo.id}
                className={classNames({
                  [styles.cur_select]: demo.id === curFileActiveId,
                })}
                onClick={() => clickExample(demo, idx)}
              />
            );
          })}
      </div>

      {/* <>
        {demoCollapsed && (
          <div className={styles.extra} onClick={() => setDemoCollapsed(!demoCollapsed)}>
            <img src={Fold} alt="" />
            <span>收起</span>
          </div>
        )}
        {!demoCollapsed && (
          <div className={styles.extra} onClick={() => setDemoCollapsed(!demoCollapsed)}>
            <img src={Unfold} alt="" />
            <span>展开</span>
          </div>
        )}
      </> */}
    </div>
  );
};

export default DemoWrapper;
