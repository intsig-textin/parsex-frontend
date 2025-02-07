import { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { useRequest, useUpdateLayoutEffect } from 'ahooks';
import { message } from 'antd';
import { useSelector } from 'umi';
import type { IFileItem } from '../data';
import { ReactComponent as WaringCircle } from '@/assets/icon/dashbord/warning.svg';
import { convertFileItem } from '../utils/convertFileItem';
import { mdNoPreview, robotRecognize } from '@/services/robot';
import { COUNT_STATUS_LIST } from '../constants';
import { generateUUID, messageByCode, notSupportPreView } from '@/utils';
import { setResultCache } from '../utils/cacheResult';
import type { ConnectState } from '@/models/connect';
import { AppIdAndSecretPosition } from '../../RecognizeParamsSettings/utils';
import { getParamsSettings } from '../../ParamsSettings/utils';
import ExhaustedModalContainer from '../../ExhaustedModal/store';

const useList = () => {
  const [list, setList] = useState<IFileItem[]>([]);

  const { service } = useSelector(
    (states: ConnectState) => states.Robot.info as { service: string },
  );

  const { setBalanceWarningModal } = ExhaustedModalContainer.useContainer();

  const containerRef = useRef<HTMLDivElement>(null);

  useUpdateLayoutEffect(() => {
    if (list?.length) {
      // 开启下载样本和PDF封面转换队列
      window.imgSourceQueue?.start();
      window.pdfToImageQueue?.start();
    }
  }, [list]);

  // ocr手动识别
  const { run: runRecognize, fetches } = useRequest(
    ({ keys, ...params }) => {
      return robotRecognize(params).then((res) => {
        if (res.code !== 200) {
          return res;
        }
        // 兼容格式
        if (!res.data?.id) {
          const data = res as any;

          // 兼容角度
          if (!data?.metrics) {
            const curSettings = getParamsSettings();
            data.dpi = curSettings.dpi || '144';
            data.metrics =
              data.pages?.map((o, i) => ({
                page_id: i + 1,
                angle: o.angle || 0,
              })) || [];
          } else {
            data.result ??= {};
            data.result.metrics = data.metrics;
            data.result.dpi = data.metrics?.[0]?.dpi;
          }

          res.data = {
            id: params.id || generateUUID(),
            count_status: 1,
            ocr_status: 1,
            cloud_ocr: 0,
            ctime: Date.now().valueOf().toString().slice(0, 10),
            utime: Date.now().valueOf().toString().slice(0, 10),
            status: null,
            img_name: params.imgName,
            img_uri: params.url,
            thumbnail: params.url,
            result: data.result,
          };

          const curSettings = getParamsSettings();
          if (curSettings) {
            if (curSettings.remove_watermark) res.data.result.remove_watermark = '1';
            if (curSettings.crop_enhance) res.data.result.crop_enhance = '1';
          }
        }
        return res;
      });
    },
    {
      manual: true,
      fetchKey: (params) => `${params.id}`,
      onSuccess: ({ data, code, msg, message: m, ...restRes }, params) => {
        // @TODO: 兼容message
        const hasCountNoMore = COUNT_STATUS_LIST.includes(data?.count_status);
        if (code !== 200) {
          message.destroy();
          if (code === 40003) {
            setBalanceWarningModal({ visible: true });
          } else {
            let resMsg = messageByCode[code] || msg || m || '请求失败';
            if (code === 40101 || code === 40102) {
              resMsg = resMsg += `，${AppIdAndSecretPosition}`;
            }
            message.error(resMsg);
          }
          // 底层服务错误不移除文件
          if (params[0].imgData && code !== 30203) {
            // 上传失败的，删除
            setList((list) => list.filter((item) => item.id !== params[0].id));
          } else {
            // 其他的标记为失败
            setList((list) =>
              list.map((item) => (item.id === params[0].id ? { ...item, status: 'wait' } : item)),
            );
          }
          return;
        }

        setList((list) =>
          list.map((item) => {
            if (item.id === params[0].id) {
              // 首次识别失败
              if (!item.url && Array.isArray(data.result) && !data.result.length) {
                return item;
              }
              if (mdNoPreview(item.name)) {
                const cover_id = data?.result?.pages?.[0]?.image_id;
                if (cover_id) {
                  data.thumbnail = cover_id;
                }
              }
              const row = hasCountNoMore
                ? { ...item, status: 'wait' }
                : { isLocalUpload: item.isLocalUpload, ...convertFileItem(data) };
              Object.assign(item, row);
            }
            return item;
          }, [] as IFileItem[]),
        );

        // 缓存结果
        setResultCache(data);
      },
      onError: (e, params) => {
        const error = e as any;
        if (error.type === 'Timeout') {
          message.error({
            icon: <WaringCircle className="warning-icon" />,
            content: '识别超时，请点击重新识别',
          });
          setList((list) => {
            list.forEach((item) => {
              if (item.id === params[0].id) {
                item.status = 'timeout';
              }
            });
            return [...list];
          });
          // if(!keysRef.current) return;
          // const curIdx = keysRef.current!.indexOf(params[0].id)
          // if(curIdx>-1){
          //   keysRef.current?.splice(curIdx,1)
          // }
        } else if (params[0].imgData) {
          // 上传失败的，删除
          setList((list) => list.filter((item) => item.id !== params[0].id));
        } else {
          // 其他的标记为失败
          setList((list) =>
            list.map((item) => (item.id === params[0].id ? { ...item, status: 'wait' } : item)),
          );
        }
      },
    },
  );

  useEffect(() => {
    const loadings = Object.entries(fetches)
      .filter(([key, value]) => {
        return value.loading;
      })
      .map(([key, value]) => key);
    setList((list) => {
      list.forEach((item) => {
        if (loadings.includes(item.id as string)) {
          item.status = 'recognize';
        }
      });
      return [...list];
    });
  }, [fetches]);

  return {
    service,
    list,
    setList,
    runRecognize,
    containerRef,
  };
};

export const listContainer = createContainer(useList);
