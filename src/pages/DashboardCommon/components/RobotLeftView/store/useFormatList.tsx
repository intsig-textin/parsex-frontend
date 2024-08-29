import { useEffect, useMemo, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { useLocation } from 'umi';
import { message, Spin } from 'antd';
import { fileContainer } from './useFile';
import { listContainer } from './useList';
import { useDispatch, useSelector } from 'dva';
import type { ConnectState } from '@/models/connect';
import { initialFile, COUNT_STATUS_LIST } from '../constants';
import { checkType, generateUUID, notSupportPreView } from '@/utils';
import { limit } from '../utils/uploadLimit';
import { convertFileItem } from '../utils/convertFileItem';
import type { IFileItem } from '../data';
import { LoadingOutlined } from '@ant-design/icons';
import { useEventListener } from 'ahooks';
import useUploadFormat from './useUploadFormat';
import useLoadPDF from '../../RobotMainView/PDFToImage/useLoadPDF';
import { ModalConfirm } from '@/components';
import { getParamsSettings } from '../../ParamsSettings/utils';
import useLatest from '@/utils/hooks/useLatest';
import { getPDFFromCacheByUrl } from '../utils/cachePDF';

//import {prefixCls} from "@/utils"

interface IProps {
  addFileList?: File[];
  onFileClick?: (item: Partial<IFileItem>) => void;
  cloudOcrKeyFromRightView?: string;
}

interface RecognizeParams {
  keys: React.ReactText[];
  type: 'ocr' | 'cloud';
  curFiles: IFileItem[];
}

interface OcrParams {
  queryParams: Record<string, any>;
}

export const beforeUpload = (fileList: any[], acceptInfo: any) => {
  let result: any[] = fileList;
  try {
    if (acceptInfo?.accept) {
      result = fileList.filter((file) => checkType(file, acceptInfo?.accept));
    }
    if (result.length !== fileList.length) {
      if (result.length === 0) {
        message.error('文件类型不支持');
        return [];
      }
      message.error(`已过滤${fileList.length - result.length}个类型不支持的文件`);
    }
  } catch (error) {
    console.log('格式校验出错');
  }
  return result;
};

const useFormatList = (initialState: IProps = {}) => {
  const { addFileList, onFileClick } = initialState!;
  const { handleCheckFileClick, curFileRef, fileBeforeUpload } = fileContainer.useContainer();

  const { info: robotInfo, acceptInfo } = useSelector(({ Robot }: ConnectState) => ({
    info: Robot.info,
    acceptInfo: Robot.acceptInfo,
  }));
  const isUploadingRef = useRef(false);
  const { setList, list, runRecognize } = listContainer.useContainer();
  const { urlParams, setModalInfo } = useUploadFormat.useContainer();
  const { pdfLoad } = useLoadPDF();
  const dispatch = useDispatch();

  const {
    query: { service, robotType },
  } = useLocation() as any;

  const needPDFPageTipsVal = useMemo(() => {
    return ['pdf_to_markdown'].includes(service) || [16].includes(robotInfo.interaction as number);
  }, [robotInfo]);
  const needPDFPageTips = useLatest(needPDFPageTipsVal);

  useEffect(() => {
    if (Array.isArray(addFileList) && addFileList.length) {
      formatList(addFileList);
    }
  }, [addFileList]);

  useEventListener('beforeunload', (e) => {
    if (isUploadingRef.current) {
      e.returnValue = '确定要关闭';
    }
  });

  // 判断pdf页数
  const processPDFPages = (pdfList: File[], nextHandle: (params?: any) => void) => {
    const pageNumber = 100; // 提示的页数
    const curSettings = getParamsSettings();
    // 设置的页数小于需要提示的页数
    if (curSettings?.page_count <= pageNumber) {
      nextHandle();
      return;
    }
    Promise.all(
      pdfList.map((file: any) => {
        return new Promise<number>((resolve) => {
          const fileReader = new FileReader();
          fileReader.onload = function (event: any) {
            const typedArray = new Uint8Array(event.target.result);
            window.pdfjsLib
              .getDocument({
                data: typedArray,
                cMapPacked: true,
                password: curSettings?.pdf_pwd,
              })
              .promise.then((pdf: any) => {
                resolve(pdf.numPages as number);
              })
              .catch((err: any) => {
                console.log('pdf getDocument error', err);
                resolve(0);
              });
          };
          fileReader.readAsArrayBuffer(file);
        });
      }),
    )
      .then((res) => {
        if (Array.isArray(res) && res.some((i) => i > pageNumber)) {
          ModalConfirm({
            title: '提示',
            content: '文件页数较多，是否需要完整识别？',
            closable: true,
            okText: '识别全部',
            cancelText: '识别前100页',
            onCancel: (e: any) => {
              if (!e.triggerCancel) {
                nextHandle({ queryParams: { page_count: pageNumber } });
              }
              return Promise.resolve();
            },
            onOk: () => {
              nextHandle();
              return Promise.resolve();
            },
          });
        } else {
          nextHandle();
        }
      })
      .catch((err) => {
        console.log('获取pdf页数报错', err);
        nextHandle();
      });
  };

  // 上传文件
  const formatList = async (originList: File[]) => {
    const fileList = beforeUpload(originList, acceptInfo);
    if (!fileList.length) return;
    const pdfList = fileList.filter((i) => i.type === 'application/pdf');
    if (needPDFPageTips.current && pdfLoad && pdfList) {
      processPDFPages(pdfList, (params: any) => formatListNextHandle(fileList, params));
    } else if (urlParams && urlParams.options?.length) {
      setModalInfo({
        title: urlParams.title,
        options: urlParams.options,
        visible: true,
        nextHandle: (params?: OcrParams) => formatListNextHandle(fileList, params),
      });
    } else {
      formatListNextHandle(fileList);
    }
  };

  const formatListNextHandle = async (fileList: File[], ocrParams?: OcrParams) => {
    fileBeforeUpload.current = curFileRef.current.id;
    isUploadingRef.current = true;
    const array: IFileItem[] = fileList.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        ...initialFile,
        id: generateUUID(),
        name: file.name,
        imageData: file,
        status: 'wait',
        isLocalUpload: true,
        url,
        thumbnail: url,
      };
    });

    setList((list) => [...[...array].reverse(), ...list]);
    const keys = array.map((item) => item.id);

    const uploadFileQ = array.map(({ name, id, imageData, url }) =>
      limit(() =>
        runRecognize({
          id,
          imgName: name,
          imgData: imageData,
          keys,
          url,
          thumbnail: url,
          ...(Number(robotType) === 3 ? { template: robotInfo.guid } : { service }),
          ...ocrParams,
        }),
      ),
    );
    (async () => {
      const key = 'upload-info';
      message.info(
        {
          key,
          icon: (
            <Spin
              indicator={<LoadingOutlined spin width={16} height={16} style={{ marginRight: 8 }} />}
            />
          ),
          content: '上传中...',
        },
        1500,
      );
      try {
        const resultList = await Promise.all(uploadFileQ);
        message.destroy(key);
        isUploadingRef.current = false;
        // 选中列表中第一个文件。
        const { url } = array[array.length - 1] || {};
        const { code, data } = resultList[resultList.length - 1] || {};
        if (code === 200 && data && !COUNT_STATUS_LIST.includes(data.count_status)) {
          const result = convertFileItem(data);
          if (!notSupportPreView(result.name)) {
            result.url = url;
            result.thumbnail = url;
          }
          handleCheckFileClick(result, true);
        }
      } catch (error) {
        message.destroy(key);
      }
      // 上传完成
      dispatch({
        type: 'Robot/saveRobotInfo',
        payload: {
          uploadEnd: Date.now(),
        },
      });
      // @TODO: 重试操作
    })();
  };

  // 重新识别
  const handleReRecognize = async (keys: React.ReactText[], type: 'ocr' | 'cloud') => {
    const curFiles = list.filter((item) => keys.includes(item.id as number));

    if (!curFiles.length) {
      return;
    }

    const fileList = getPDFFromCacheByUrl(curFiles.map((i) => i.url));
    const pdfList = fileList.filter((i) => i.type === 'application/pdf');
    if (needPDFPageTips.current && pdfLoad && pdfList) {
      processPDFPages(pdfList, (params?: any) =>
        handleRecognizeNextHandle({ keys, curFiles, type }, params),
      );
    } else if (urlParams && urlParams.options?.length) {
      setModalInfo({
        title: urlParams.title,
        options: urlParams.options,
        visible: true,
        nextHandle: (params?: OcrParams) =>
          handleRecognizeNextHandle({ keys, curFiles, type }, params),
      });
    } else {
      handleRecognizeNextHandle({ keys, curFiles, type });
    }
  };

  const handleRecognizeNextHandle = async (
    { curFiles, keys, type }: RecognizeParams,
    ocrParams?: OcrParams,
  ) => {
    fileBeforeUpload.current = curFileRef.current.id;
    const uploadFileQ = curFiles.map(({ name, id, imageData }) =>
      limit(() => {
        if (id === curFileRef.current.id) {
          dispatch({
            type: 'Common/setResultLoading',
            payload: {
              resultLoading: true,
            },
          });
        }
        return runRecognize({
          id,
          imgName: name,
          keys: keys,
          ...(Number(robotType) === 3 ? { template: robotInfo.guid } : { service }),
          ...ocrParams,
        });
      }),
    );
    setList((list) =>
      list.map((item) => (keys.includes(`${item.id}`) ? { ...item, status: 'wait' } : item)),
    );

    (async () => {
      const key = 're-recognize-info';
      message.info(
        {
          key,
          icon: (
            <Spin
              indicator={<LoadingOutlined spin width={16} height={16} style={{ marginRight: 8 }} />}
            />
          ),
          content: '识别中...',
        },
        1500,
      );
      try {
        const resultList = await Promise.all(uploadFileQ);
        message.destroy(key);
        // 更新当前点击文件信息
        const oldActiveFile = resultList.find(
          (item) => item && item.code === 200 && item.data?.id === curFileRef.current.id,
        );
        const firstFile = resultList.find((item) => item && item.code === 200 && item.data?.id);
        const nextActiveFile = oldActiveFile || firstFile;
        const activeFile = list.find((item) => item.id === nextActiveFile?.data?.id);
        if (
          oldActiveFile &&
          activeFile &&
          activeFile?.id === oldActiveFile.data.id &&
          onFileClick
        ) {
          onFileClick({
            ...activeFile,
            url: curFileRef.current.url?.startsWith('blob:http')
              ? curFileRef.current.url
              : `${activeFile.url}`,
            t: Date.now(),
          });
        } else if (firstFile && activeFile) {
          handleCheckFileClick(activeFile, true);
        }
      } catch (error) {
        console.log('重新识别error', error);
      }
      message.destroy(key);
      dispatch({
        type: 'Common/setResultLoading',
        payload: {
          resultLoading: false,
        },
      });
      dispatch({
        type: 'Robot/saveRobotInfo',
        payload: {
          uploadEnd: Date.now(),
        },
      });
      // @TODO: 重试操作
    })();
  };

  // 重新识别样例
  const handleReRecognizeExample = async (id: number) => {
    if (curFileRef.current.isExample && curFileRef.current.id === id && onFileClick) {
      dispatch({
        type: 'Common/setResultLoading',
        payload: {
          resultLoading: true,
        },
      });
      await onFileClick({ ...curFileRef.current, t: Date.now() });
    }
  };

  return {
    formatList,
    handleReRecognize,
    handleReRecognizeExample,
  };
};

export const formatListContainer = createContainer<ReturnType<typeof useFormatList>, IProps>(
  useFormatList,
);
