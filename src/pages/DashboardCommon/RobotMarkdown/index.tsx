import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { message } from 'antd';
import { parse } from 'querystring';
import { connect } from 'umi';
import type { IFileItem } from '../RobotStruct/data';
import { robotRecognize, robotRecognizeHistory } from '@/services/robot';
import LeftView from '../RobotStruct/containers/LeftView/Index';
import MainView from '../RobotStruct/containers/MainView/Index';
import RobotRightView from './containers/RightView';
import { ResultType } from './containers/RightView/RightView';
import Catalog from './containers/Catalog';
import styles from '../RobotStruct/Index.less';
import { storeContainer } from '../RobotStruct/store';
import type { ConnectState, IRobotModelState } from '@/models/connect';
import { RobotLayout, RobotHeader } from '../components';
import { MultiPageMarkdown } from './MarkdownRender';
import { formatResult } from './utils';

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
      setRefreshAutoCollapsed(currentFile.id);
    } else {
      setRefreshAutoCollapsed(false);
    }
  }, [currentFile]);

  useEffect(() => {
    if (resultJson?.detail_new) {
      setCurrentFile((pre) => {
        return {
          ...pre,
          newRects: formatResult({ ...pre.originResult, detail: resultJson?.detail_new }, dataType),
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
        });
    } else if (current.id) {
      // 获取历史识别结果
      robotRecognizeHistory(current.id as number)
        .then((res) => {
          // 处理回调
          handleResult(res, 'data');
        })
        .catch(() => {
          setCurrentFile({ ...current, status: 'wait' });
        });
    }

    // 处理接口返回的结果
    const handleResult = (result: any, type: 'example' | 'data') => {
      // @TODO:未做异常处理
      if (result.code !== 200) {
        message.destroy();
        message.error(result.msg || result.message);
        // 更新store
        setCurrentFile({ ...current, status: 'wait' });
        return;
      }
      if (result.data.result) {
        const resultData = result.data.result;

        // 更新json识别结果
        setResultJson(resultData);
      }

      const { count_status, ocr_status = 1 } = result.data;
      setCurrentFile({
        ...current,
        countStatus: count_status,
        status: ocr_status === 1 ? 'complete' : 'wait',
        imageData: type === 'data' ? '' : current.imageData,
        cloudStatus: type === 'data' ? current.cloudStatus : 0,
        originResult: result.data.result,
        rects: formatResult(result.data.result, dataType),
        newRects:
          result.data.result?.detail_new &&
          formatResult({ ...result.data.result, detail: result.data.result?.detail_new }, dataType),
        dpi: result.data.result?.dpi || 72,
      });
    };
  };

  // 获取当前选择的list
  const getChooseList = (list: any) => {
    setCurrentChoosenList(list);
  };
  // 处理上传
  const handleUpload = (files: any) => {
    setFileList(files);
  };

  const onTabChange = (type: ResultType) => {
    setDataType(type);
    setCurrentFile((pre) => {
      if (pre.originResult) {
        return {
          ...pre,
          rects: formatResult(pre.originResult, type),
          newRects:
            pre.originResult?.detail_new &&
            formatResult({ ...pre.originResult, detail: pre.originResult?.detail_new }, type),
        };
      }
      return pre;
    });
  };

  const curService = service as string;

  return (
    <div className={styles.strutContainer}>
      <RobotHeader
        extra={
          <span className={styles.apiText}>
            <span>热点指南：</span>
            <a
              href="https://qw01obudp42.feishu.cn/docx/Bt6ZdIW2PohoNuxgsmNcWzyVn8d"
              target="_blank"
            >
              前端与SDK集成攻略
            </a>
          </span>
        }
      />
      <RobotLayout
        leftView={
          <LeftView
            currentFile={currentFile}
            getChooseList={getChooseList}
            onFileClick={onFileClick}
            addFileList={fileList}
          />
        }
        showCollapsed
        autoCollapsed={refreshAutoCollapsed}
        mainView={
          <>
            <Catalog data={currentFile?.originResult?.catalog} />
            <MainView
              currentFile={currentFile as any}
              onUpload={handleUpload}
              showText={false}
              autoLink
              angleFix
            />
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
                data={
                  (showModifiedMarkdown ? currentFile?.newRects : currentFile?.rects) ||
                  resultJson?.markdown
                }
                dpi={currentFile?.dpi}
                dataType={dataType}
                markdownMode={markdownMode}
                onMarkdownChange={updateResultJson}
                markdownEditorRef={markdownEditorRef}
                onSave={saveResultJson}
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
