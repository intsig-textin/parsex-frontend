import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { message } from 'antd';
import { parse } from 'querystring';
import { connect, useParams, useSelector } from 'umi';
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
import type { Dispatch } from 'umi';
import { AppIdAndSecretPosition } from '../components/ParamsSettings';

interface PageProps {
  Robot: IRobotModelState;
  dispatch: Dispatch;
}
const MarkdownPage: FC<PageProps> = (props) => {
  const {
    dispatch,
    Robot: { info },
  } = props;
  // 当前选中的列表
  const [currentChoosenList, setCurrentChoosenList] = useState([]);
  // 新上传的文件
  const [fileList, setFileList] = useState<any[]>([]);
  const [refreshAutoCollapsed, setRefreshAutoCollapsed] = useState<any>();
  const [dataType, setDataType] = useState<ResultType>(ResultType.md);

  const { service } = useSelector(
    (states: ConnectState) => states.Robot.info as { service: string },
  );
  const { currentFile, setCurrentFile, setResultJson, resultJson } = storeContainer.useContainer();

  useEffect(() => {
    dispatch({
      type: 'Robot/getRobotInfo',
      payload: {
        service: 'pdf_to_markdown',
      },
    });
  }, []);

  useEffect(() => {
    if (currentFile && currentFile.status === 'complete') {
      setRefreshAutoCollapsed(currentFile.id);
    } else {
      setRefreshAutoCollapsed(false);
    }
  }, [currentFile]);

  // 单击左侧样本的回调
  const onFileClick = (current: Partial<IFileItem>) => {
    const { isExample } = current;

    // 清空之前识别结果
    setResultJson(null);
    // 更新store
    setCurrentFile({ ...current, status: 'upload' });
    // 识别样例
    if (isExample) {
      console.log('current.name', current);
      import(`@/demo/files/${current.id}.json`)
        .then((res) => {
          console.log('res', res);
          setTimeout(() => {
            // 处理回调
            handleResult(res, 'example');
          }, 2000);
        })
        .catch((e) => {
          console.log('e', e);
          setCurrentFile({ ...current, status: 'wait' });
        });
    } else {
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
        let resMsg = result.msg || result.message;
        if (result.code === 40101) {
          resMsg = resMsg += `，${AppIdAndSecretPosition}`;
        }
        message.error(resMsg);
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
        dpi: result.data.result?.dpi || 72,
        ctime: Date.now().valueOf().toString().slice(0, 10),
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
        };
      }
      return pre;
    });
  };

  const curService = service as string;

  return (
    <div className={styles.strutContainer}>
      <RobotHeader />
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
          >
            <MultiPageMarkdown
              data={currentFile?.rects || resultJson?.markdown}
              dpi={currentFile?.dpi}
              dataType={dataType}
            />
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
