import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { message } from 'antd';
import type { IFileItem } from './data';
import { robotRecognize, robotRecognizeHistory } from '@/services/robot';
import LeftView from './containers/LeftView/Index';
import MainView from './containers/MainView/Index';
import RobotRightView from './containers/RightView/Index';
import styles from './Index.less';
import { parse } from 'querystring';
import { storeContainer } from './store';
import { connect } from 'umi';
import type { ConnectState, IRobotModelState } from '@/models/connect';
import { RobotLayout, RobotHeader } from '../components';
import DetailComponent from './components/DetailComponent';
import MarkdownRender from '../RobotMarkdown/MarkdownRender';

interface PageProps {
  Robot: IRobotModelState;
}
const Page: FC<PageProps> = (props) => {
  const {
    Robot: {
      info: { name, guid },
    },
  } = props;
  // 当前选中的列表
  const [currentChoosenList, setCurrentChoosenList] = useState([]);
  // 新上传的文件
  const [fileList, setFileList] = useState<any[]>([]);
  const { service, robotType } = parse(window.location.search.slice(1));
  const {
    currentFile,
    setCurrentFile,
    setResultJson,
    setRectList,
    setCurUid,
    resultJson,
    setItemList,
    setTableList,
    multiple,
  } = storeContainer.useContainer();

  useEffect(() => {
    // 更新store
    // dispatch({
    //   type: 'StructRobot/initCurrentFileDispatch',
    // });
    setCurrentFile({});
  }, [name]);

  // 单击左侧样本的回调
  const onFileClick = (current: Partial<IFileItem>) => {
    const { isExample } = current;

    // 清空之前识别结果
    setItemList([]);
    setTableList([]);
    setResultJson(null);
    setRectList([]);
    setCurUid('');
    // 更新store
    setCurrentFile({ ...current, status: 'upload' });
    // 识别样例
    if (isExample) {
      robotRecognize({
        id: current.id as any,
        exampleFlag: isExample,
        imgName: current.name,
        ...(Number(robotType) === 3 ? { template: guid } : { service: service as string }),
      })
        .then((res) => {
          // 处理回调
          if (isExample) {
            handleResult(res, 'example');
          } else {
            handleResult(res, 'data');
          }
        })
        .catch(() => {
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
        mainView={
          <MainView currentFile={currentFile as any} onUpload={handleUpload} showText={multiple} />
        }
        rightView={
          <RobotRightView
            current={currentFile as IFileItem}
            currentChoosenList={currentChoosenList}
            resultJson={resultJson}
            // ocr识别结果
            // 页面title
            titleName={name as string}
            service={curService}
            // component={Component}
          >
            {['pdf_to_markdown'].includes(curService) ? (
              <MarkdownRender content={resultJson?.markdown} />
            ) : (
              <DetailComponent current={currentFile as IFileItem} />
            )}
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
      <Page {...props} />
    </Provider>
  );
});
