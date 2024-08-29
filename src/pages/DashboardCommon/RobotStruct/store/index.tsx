import { createContainer } from 'unstated-next';
import { ResultType } from '../data.d';
import type { IFileItem, IImgResult, IItemList, IRectListItem, KeyTypeEnum } from '../data.d';
import { useState } from 'react';
import { getItemListCopyContent } from '../utils';
import { useLocation } from 'dva';

interface ContentConfig {
  type?: ResultType;
  separate?: string;
  exportBase64?: boolean;
  isExport?: boolean;
}

const useStore = () => {
  const [currentFile, setCurrentFile] = useState<IFileItem | Record<string, any>>({} as any);
  const [resultJson, setResultJson] = useState<IImgResult | null>(null);
  // 识别结果
  const [itemList, setItemList] = useState<IItemList[]>([]);
  const [tableList, setTableList] = useState<IItemList[][]>();
  const [key, setKey] = useState<KeyTypeEnum>();
  // 当前选中的框选id
  const [curUid, setCurUid] = useState<any>('');
  // 框选数据
  const [rectList, setRectList] = useState<IRectListItem[]>([]);

  const { query } = useLocation() as any;
  const multiple = ['qr_code'].includes(query.service);

  const generateCopyContent = ({ separate, type }: ContentConfig) => {
    if (type === ResultType.json) {
      return JSON.stringify(resultJson);
    }
    let content = getItemListCopyContent(itemList, separate);
    tableList?.map((item) => {
      content += content ? '\n' : '';
      content += getItemListCopyContent(item, separate);
    });
    return content;
  };
  return {
    currentFile,
    setCurrentFile,
    resultJson,
    setResultJson,
    itemList,
    setItemList,
    tableList,
    setTableList,
    generateCopyContent,
    key,
    setKey,
    curUid,
    setCurUid,
    rectList,
    setRectList,
    multiple,
  };
};
export const storeContainer = createContainer(useStore);
