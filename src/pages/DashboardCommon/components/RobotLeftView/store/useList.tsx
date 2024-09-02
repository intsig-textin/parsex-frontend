import { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useSelector } from 'umi';
import type { IFileItem } from '../data';
import { ReactComponent as WaringCircle } from '@/assets/icon/dashbord/warning.svg';
import { convertFileItem } from '../utils/convertFileItem';
import { robotRecognize } from '@/services/robot';
import { COUNT_STATUS_LIST } from '../constants';
import { generateUUID, messageByCode, notSupportPreView } from '@/utils';
import { setResultCache } from '../utils/cacheResult';
import type { ConnectState } from '@/models/connect';
import { AppIdAndSecretPosition } from '../../ParamsSettings';
import { getParamsSettings } from '../../ParamsSettings/utils';

interface IResult {
  list: IFileItem[];
  total: number;
  pageNum: number;
}

const useList = () => {
  const [list, setList] = useState<IFileItem[]>([]);

  const { service } = useSelector(
    (states: ConnectState) => states.Robot.info as { service: string },
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const queuesRef = useRef<number[]>();

  // ocr手动识别
  const { run: runRecognize, fetches } = useRequest(
    ({ keys, ...params }) => {
      if (!queuesRef.current || !queuesRef.current.length) {
        queuesRef.current = [...(keys || [])];
      }
      params.service = service;
      return robotRecognize(params).then((res) => {
        if (res.code !== 200) {
          return res;
        }
        // 兼容格式
        if (!res.data?.id) {
          const data = res.data;

          // 兼容角度
          if (!data.metrics) {
            const curSettings = getParamsSettings();
            data.dpi = curSettings.dpi || '144';
            data.metrics =
              data.pages?.map((o, i) => ({
                page_id: i + 1,
                angle: o.angle || 0,
              })) || [];
          }

          res.data = {
            id: generateUUID(),
            count_status: 1,
            ocr_status: 1,
            cloud_ocr: 0,
            ctime: Date.now().valueOf().toString().slice(0, 10),
            utime: Date.now().valueOf().toString().slice(0, 10),
            status: null,
            img_name: params.imgName,
            img_uri: params.url,
            thumbnail: params.url,
            result: data,
          };
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
          let resMsg = messageByCode[code] || msg || m || '请求失败';
          if (code === 40101) {
            resMsg = resMsg += `，${AppIdAndSecretPosition}`;
          }
          message.error(resMsg);
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
              const row = hasCountNoMore
                ? { ...item, status: 'wait' }
                : { isLocalUpload: item.isLocalUpload, ...convertFileItem(data) };
              Object.assign(item, row);
              if (!notSupportPreView(item.name) && params[0]?.url?.startsWith('blob:http')) {
                item.url = params[0]?.url;
                item.thumbnail = params[0]?.thumbnail;
              }
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
    const ids = Object.keys(fetches)
      .filter((id) => fetches[id].loading)
      .map(String);

    const queues = queuesRef.current || [];
    const queuesMap = queues.map(String);
    ids.forEach((id) => {
      const idx = queuesMap.indexOf(id as any);

      if (idx > -1) {
        queues.splice(idx, 1);
      }
    });
    if (ids.length > 0) {
      setList((list: IFileItem[]) => {
        const newList = list.map((item: any) => {
          if (ids.includes(`${item.id}`)) {
            return { ...item, status: 'recognize' };
          }
          if (queues.map(String).includes(`${item.id}`)) {
            return { ...item, status: 'queue' };
          }
          return item;
        });
        return newList;
      });
    }
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
