import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Carousel, message, Row } from 'antd';
import { parse } from 'querystring';
import { connect } from 'umi';
import lodash from 'lodash';
import type { IFileItem } from './data';
import {
  downloadOcrImg,
  imagePreview,
  mdNoPreview,
  robotRecognize,
  robotRecognizeHistory,
} from '@/services/robot';
import LeftView from '../components/RobotLeftView/Index';
import MainView from './containers/MainView/Index';
import RobotRightView from './containers/RightView';
import { ResultType } from './containers/RightView/RightView';
import Catalog from './containers/Catalog';
import styles from './index.less';
import { storeContainer } from './store';
import type { ConnectState, IRobotModelState } from '@/models/connect';
import { RobotLayout, RobotHeader } from '../components';
import { MultiPageMarkdown } from './MarkdownRender';
import { formatResult } from './utils';
import { base64ToURL, getFileNameAndType } from '@/utils';
import { QuestionToolTips } from '@/components';

interface PageProps {
  Robot: IRobotModelState;
}
const MarkdownPage: FC<PageProps> = (props) => {
  const {
    Robot: { info },
  } = props;
  // 当前选中的列表
  const [currentChoosenList, setCurrentChoosenList] = useState([]);
  // 新上传的文件
  const [fileList, setFileList] = useState<any[]>([]);
  const [refreshAutoCollapsed, setRefreshAutoCollapsed] = useState<any>();
  const [dataType, setDataType] = useState<ResultType>(ResultType.md);

  const { service } = parse(window.location.search.slice(1));
  const {
    currentFile,
    setCurrentFile,
    setResultJson,
    resultJson,
    markdownMode,
    showModifiedMarkdown,
    updateResultJson,
    markdownEditorRef,
    saveResultJson,
  } = storeContainer.useContainer();

  useEffect(() => {
    if (currentFile && currentFile.status === 'complete') {
      // setRefreshAutoCollapsed(currentFile.id);
    } else {
      setRefreshAutoCollapsed(false);
    }
  }, [currentFile]);

  useEffect(() => {
    if (resultJson?.detail_new) {
      setCurrentFile((pre) => {
        return {
          ...pre,
          newRects: formatResult({ ...pre.result, detail: resultJson?.detail_new }, dataType, {
            angle: !pre.ignoreAngle,
          }),
        };
      });
    }
  }, [resultJson?.detail_new, dataType]);

  // 单击左侧样本的回调
  const onFileClick = (current: Partial<IFileItem>) => {
    const { isExample } = current;

    // 清空之前识别结果
    setResultJson(null);
    // 更新store
    setCurrentFile({ ...current, status: 'upload' });
    // 识别样例
    if (isExample) {
      robotRecognize({
        id: current.id as any,
        exampleFlag: isExample,
        imgName: current.name,
        service: service as string,
      })
        .then((res) => {
          // 处理回调
          handleResult(res, 'example');
        })
        .catch(() => {
          setCurrentFile({ ...current, status: 'wait' });
        })
        .finally(() => {});
    } else if (current.id) {
      // 获取历史识别结果
      robotRecognizeHistory(current.id as number)
        .then((res) => {
          // 处理回调
          handleResult(res, 'data');
        })
        .catch(() => {
          setCurrentFile({ ...current, status: 'wait' });
        })
        .finally(() => {});
    }

    // 处理接口返回的结果
    const handleResult = async (result: any, type: 'example' | 'data') => {
      // @TODO:未做异常处理
      if (result.code !== 200) {
        message.destroy();
        message.error(result.msg || result.message);
        // 更新store
        setCurrentFile({ ...current, status: 'wait' });
        return;
      }
      const resultData = result.data.result;
      // 更新json识别结果
      setResultJson(resultData);

      const { count_status } = result.data;
      const isEmptyData = ['{}', '[]'].includes(JSON.stringify(resultData));
      if (isEmptyData) {
        message.warning('无识别结果');
      }
      const curFileData = lodash.omit(current, [
        'showToggle',
        'canToggle',
        'hiddenRects',
        'preview_url',
        'scrollIntoView',
      ]);
      const filename = current.name || '';
      const noPreviewType = /\.[a-z]+$/i.test(filename) && mdNoPreview(filename);
      const isImage = current.isExample ? !current.isPDF : imagePreview(filename);
      const isCropRemove =
        String(resultData.remove_watermark) === '1' || String(resultData.crop_enhance) === '1';
      const previewByRes =
        isCropRemove &&
        resultData.pages?.[0] &&
        (resultData.pages[0].image_id || resultData.pages[0].base64);
      let ignoreAngle; // base64图片是转正的图忽略角度
      if (previewByRes && isImage) {
        const image_id = resultData.pages[0].image_id;
        const preview_url = { origin: current.url, result: '' };
        if (image_id) {
          const { data, code } = await downloadOcrImg(image_id);
          if (code === 200) {
            preview_url.result = 'data:image/jpeg;base64,' + data.image;
          }
        } else {
          preview_url.result = 'data:image/jpeg;base64,' + resultData.pages[0].base64;
          ignoreAngle = true;
        }
        preview_url.result = base64ToURL(preview_url.result);
        curFileData.url = preview_url.result;
        curFileData.preview_url = preview_url;
      }
      // 重新识别
      if (current.t && currentFile?.id === current.id && currentFile.preview_url) {
        if (curFileData.preview_url) {
          curFileData.preview_url.origin = currentFile.preview_url.origin;
        } else {
          curFileData.url = currentFile.preview_url.origin;
        }
      }
      if (isCropRemove) {
        Object.assign(curFileData, {
          showToggle: true,
          canToggle: !noPreviewType,
          hiddenRects: false,
        });
      }
      let { type: fileType } = getFileNameAndType(filename);
      if (fileType.includes('doc')) {
        fileType = 'Word';
      } else if (fileType.includes('htm')) {
        fileType = 'HTML';
      } else if (fileType.includes('pdf')) {
        fileType = 'PDF';
      } else {
        fileType = '图片';
      }
      curFileData.fileType = fileType;
      const parserPages =
        ((!isImage && previewByRes) || noPreviewType) &&
        Array.isArray(resultData?.pages) &&
        resultData?.pages.map((item: any) => {
          const row: Record<string, any> = {
            ...lodash.pick(item, ['width', 'height', 'image_id']),
            index: item.page_id,
          };
          if (item.image_id) {
            row.fixedRotate = item.angle ? 360 - item.angle : item.angle;
          } else if (!item.image_id && item.base64) {
            row.image = { base64: item.base64 };
            ignoreAngle = true;
          }
          return row;
        });
      setCurrentFile({
        ...curFileData,
        ignoreAngle,
        countStatus: count_status,
        status: isEmptyData ? 'wait' : 'complete',
        imageData: type === 'data' ? '' : current.imageData,
        cloudStatus: type === 'data' ? current.cloudStatus : 0,
        result: resultData,
        rects: formatResult(resultData, dataType, { angle: !ignoreAngle }),
        newRects:
          resultData?.detail_new &&
          formatResult({ ...resultData, detail: resultData?.detail_new }, dataType, {
            angle: !ignoreAngle,
          }),
        dpi: resultData?.dpi || 72,
        parserPages,
      });
    };
  };

  // 处理上传
  const handleUpload = (files: any) => {
    setFileList(files);
  };

  const onTabChange = (type: ResultType) => {
    setDataType(type);
    setCurrentFile((pre) => {
      if (pre.result) {
        return {
          ...pre,
          rects: formatResult(pre.result, type, { angle: !pre.ignoreAngle }),
          newRects:
            pre.result?.detail_new &&
            formatResult({ ...pre.result, detail: pre.result?.detail_new }, type, {
              angle: !pre.ignoreAngle,
            }),
        };
      }
      return pre;
    });
  };

  const onToggleView = (val?: boolean) => {
    setCurrentFile((pre) => {
      if (pre.canToggle) {
        const type = typeof val === 'boolean' ? val : !pre.hiddenRects;
        if (pre.preview_url) {
          pre.url = type ? pre.preview_url.origin : pre.preview_url.result;
        } else {
          if (pre.parserPages) {
            pre.parserPagesRes = pre.parserPages;
            pre.parserPages = undefined;
          } else {
            pre.parserPages = pre.parserPagesRes;
          }
        }
        return {
          ...pre,
          hiddenRects: type,
          scrollIntoView: true,
        };
      }
      return pre;
    });
  };

  const onToggleClick = () => {
    onToggleView(!currentFile.hiddenRects);
  };

  const onContentClick = () => {
    if (currentFile && currentFile.canToggle && currentFile.hiddenRects) {
      onToggleView(false);
    }
  };

  const curService = service as string;

  return (
    <div className={styles.wrapper}>
      <RobotHeader
        extra={
          <Row className={styles.apiText} align="middle">
            <span>热点指南：</span>
            <Carousel
              style={{ width: 126, whiteSpace: 'nowrap' }}
              dotPosition="right"
              dots={false}
              autoplay
              autoplaySpeed={5000}
            >
              <a
                href="https://qw01obudp42.feishu.cn/docx/Bt6ZdIW2PohoNuxgsmNcWzyVn8d"
                target="_blank"
              >
                前端与SDK集成攻略
              </a>
              <a
                href="https://qw01obudp42.feishu.cn/docx/GmEGdWTb8ozSdkxUiSgcPQi6nJH"
                target="_blank"
              >
                文档解析必备Tips
              </a>
            </Carousel>
          </Row>
        }
      />
      <RobotLayout
        leftView={
          <LeftView
            currentFile={currentFile}
            // getChooseList={getChooseList}
            onFileClick={onFileClick as any}
            addFileList={fileList}
            showSettings={true}
          />
        }
        showCollapsed
        autoCollapsed={refreshAutoCollapsed}
        catalogView={<Catalog data={currentFile?.result?.catalog} />}
        mainView={
          <>
            <MainView
              currentFile={currentFile as any}
              onUpload={handleUpload}
              docConvertToPDF={false}
              showText={false}
              autoLink
              angleFix
            />
            {currentFile?.showToggle && (
              <div className={styles.toggleView}>
                <QuestionToolTips
                  title={`暂不支持${currentFile.fileType}格式`}
                  visible={currentFile?.canToggle ? false : undefined}
                  placement="top"
                  arrowPointAtCenter={false}
                  defaultPopupContainer
                >
                  <a
                    // className={classNames({ [styles.disabledClick]: currentFile.hiddenRects })}
                    onClick={onToggleClick}
                  >
                    {currentFile.hiddenRects ? '查看结果' : '查看原图'}
                  </a>
                </QuestionToolTips>
              </div>
            )}
          </>
        }
        rightView={
          <RobotRightView
            current={currentFile as IFileItem}
            currentChoosenList={currentChoosenList}
            onTabChange={onTabChange}
            resultJson={resultJson}
            titleName={info.name as string}
            service={curService}
            markdown
            disableEdit={resultJson?.detail_new && !showModifiedMarkdown}
          >
            {
              <MultiPageMarkdown
                markdown={resultJson?.markdown}
                data={showModifiedMarkdown ? currentFile?.newRects : currentFile?.rects}
                dpi={currentFile?.dpi}
                dataType={dataType}
                markdownMode={markdownMode}
                onMarkdownChange={updateResultJson}
                markdownEditorRef={markdownEditorRef}
                onSave={saveResultJson}
                onContentClick={onContentClick}
              />
            }
          </RobotRightView>
        }
      />
    </div>
  );
};
const mapStateToProps = ({ Robot }: ConnectState) => ({
  Robot,
});
export default connect(mapStateToProps)((props: any) => {
  const { Provider } = storeContainer;
  return (
    <Provider>
      <MarkdownPage {...props} />
    </Provider>
  );
});
