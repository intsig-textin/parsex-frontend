import { useState, useEffect, useRef } from 'react';
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
import { ReactComponent as LeftOutlined } from '@/assets/icon/ic_left.svg';
import classNames from 'classnames';
import PDFToImage from '../../../RobotMainView/PDFToImage';
import { getFileNameAndType, getStaticImgURL } from '@/utils';

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
      const { type } = getFileNameAndType(Robot.fileFromUrl);
      const row: IFileItem = {
        id: Robot.fileFromUrl,
        name: `样本库-${Robot.fileFromUrl}`,
        url,
        img_uri: url,
        isPDF: url.includes('.pdf') || url.includes('.doc'),
        isDoc: url.includes('.doc'),
        thumbnail: url,
        thumbnail_id: ['doc', 'docx', 'html', 'mhtml', ''].includes(type) ? Robot.fileFromUrl : '',
        isExample: true,
        status: 'wait',
      };
      handleCheckFileClick(row);
    }
  }, [Robot.fileFromUrl]);

  useEffect(() => {
    if (!robotInfo.image) return;

    const sampleImageList = robotInfo.image ? robotInfo.image.split('、') : [];
    const displaySampleList = sampleImageList;
    const sampleList: IFileItem[] = displaySampleList.map((url: any, index: number) => {
      const item = url.replace(/\.[a-zA-Z]+?$/i, '');
      return {
        id: item.split('filename=')[1],
        name: `样例${index + 1}`,
        url: item,
        img_uri: url,
        isPDF: url.includes('.pdf') || url.includes('.doc'),
        isDoc: url.includes('.doc'),
        thumbnail: item,
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

  // TODO: 示例滚动组件封装成统一的公共组件，目前有两处在使用，重复了
  // src/pages/DashboardCommon/RobotExtract/components/LeftView/components/LeftExample/index.tsx
  const demoImageRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const shouldShowArrow = demoList?.length > 3;

  useEffect(() => {
    if (!shouldShowArrow) {
      return;
    }
    const handleScroll = () => {
      if (demoImageRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = demoImageRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
      }
    };

    if (demoImageRef.current) {
      demoImageRef.current.addEventListener('scroll', handleScroll);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      if (demoImageRef.current) {
        demoImageRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [shouldShowArrow]);

  const scrollByPixels = (pixels: number) => {
    if (demoImageRef.current) {
      demoImageRef.current.scrollBy({
        left: pixels,
        behavior: 'smooth',
      });
    }
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
      <div className={styles.demoImageWrapper}>
        <div
          ref={demoImageRef}
          className={`${styles.demoImage} ${!demoCollapsed ? 'demo-collapsed' : ''}`}
        >
          {shouldShowArrow && (
            <>
              <div
                className={classNames(styles.arrowBox, styles.leftArrow)}
                onClick={() => scrollByPixels(-267)}
                style={!showLeftArrow ? { display: 'none' } : { zIndex: 10 }}
              >
                <LeftOutlined />
              </div>
              <div
                className={classNames(styles.arrowBox, styles.rightArrow)}
                onClick={() => scrollByPixels(267)}
                style={!showRightArrow ? { display: 'none' } : { zIndex: 10 }}
              >
                <LeftOutlined />
              </div>
            </>
          )}
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
                    type="cover"
                  />
                </div>
              ) : (
                <Img
                  {...demo}
                  key={idx}
                  className={classNames({
                    [styles.cur_select]: demo.id === curFileActiveId,
                  })}
                  onClick={() => clickExample(demo, idx)}
                />
              );
            })}
        </div>
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
