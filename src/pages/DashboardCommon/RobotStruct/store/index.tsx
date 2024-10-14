import { createContainer } from 'unstated-next';
import { omit } from 'lodash';
import { ResultType } from '../data.d';
import type { IFileItem, IImgResult, IItemList, IRectListItem, KeyTypeEnum } from '../data.d';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getItemListCopyContent } from '../utils';
import type { IRectItem } from '../../RobotMarkdown/utils';
import { isMarkdownHeader, splitMarkdownHeader } from '../../RobotMarkdown/utils';
import type Vditor from 'vditor';
import { useSelector } from 'dva';
import type { ConnectState } from '@/models/connect';
import { message } from 'antd';

interface ContentConfig {
  type?: ResultType;
  separate?: string;
  exportBase64?: boolean;
  isExport?: boolean;
}

export interface ResultJsonUpdateParams {
  value: string;
  contentItem: IRectItem;
  markdown?: string;
}

const useStore = () => {
  const [currentFile, setCurrentFile] = useState<IFileItem | Record<string, any>>({} as any);
  const [resultJson, setResultJson] = useState<IImgResult | null>(null);
  const [resultJsonSaveLoading, setResultJsonSaveLoading] = useState(false);
  // 识别结果
  const [itemList, setItemList] = useState<IItemList[]>([]);
  const [tableList, setTableList] = useState<IItemList[][]>();
  const [key, setKey] = useState<KeyTypeEnum>();
  // 当前选中的框选id
  const [curUid, setCurUid] = useState<any>('');
  // 框选数据
  const [rectList, setRectList] = useState<IRectListItem[]>([]);

  // markdown编辑/查看模式
  const [markdownMode, setMarkdownMode] = useState<'view' | 'edit'>('view');
  const markdownEditorRef = useRef<Vditor | null>(null);

  // 是否展示markdown最新修改结果
  const [_showModifiedMarkdown, setShowModifiedMarkdown] = useState<boolean>(true);
  const showModifiedMarkdown = useMemo(
    () => _showModifiedMarkdown && resultJson?.detail_new,
    [_showModifiedMarkdown, resultJson],
  );

  // 文件切换重置编辑状态
  useEffect(() => {
    setMarkdownMode('view');
    setShowModifiedMarkdown(true);
  }, [currentFile?.id]);

  // const { fileSaveFlag } = useSelector((store: ConnectState) => ({
  //   fileSaveFlag: store.User.file_save,
  // }));
  // const shouldSaveMarkdown = !!fileSaveFlag && !currentFile?.isExample;
  const shouldSaveMarkdown = !currentFile?.isExample;
  const showAutoSave = useMemo(() => {
    return !!shouldSaveMarkdown && markdownMode === 'edit';
  }, [shouldSaveMarkdown, markdownMode, currentFile]);

  const [autoSaveMarkdown, _setAutoSaveMarkdown] = useState<boolean>(
    (localStorage.getItem('autoSaveMarkdown') ?? 'true') === 'true',
  );
  const setAutoSaveMarkdown = (value: boolean) => {
    _setAutoSaveMarkdown(value);
    localStorage.setItem('autoSaveMarkdown', value.toString());
  };

  const autoSaveTimerRef = useRef<any>();

  const saveResultJson = async (silent = true) => {
    if (!shouldSaveMarkdown) {
      return;
    }
    setResultJsonSaveLoading(true);
    try {
      // await robotUpdateHistory({
      //   id: currentFile.id,
      //   type: 1,
      //   data: resultJson,
      // });
      if (!silent) {
        message.success('保存成功');
      }
    } catch (error) {
      console.log(error);
      if (!silent) {
        message.success('保存失败');
      }
    }
    setResultJsonSaveLoading(false);
  };

  useEffect(() => {
    if (showAutoSave && autoSaveMarkdown) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setInterval(() => {
        saveResultJson();
      }, 10 * 1000);
    } else {
      clearInterval(autoSaveTimerRef.current);
    }
  }, [showAutoSave, autoSaveMarkdown, resultJson]);

  const rawResultJson = useMemo(
    () => omit(resultJson, ['detail_new', 'markdown_new']),
    [resultJson],
  );

  // 更新json结果
  const updateResultJson = ({ value, contentItem, markdown }: ResultJsonUpdateParams) => {
    setResultJson((pre) => {
      let newDatail = [...(pre?.detail_new || pre?.detail)];
      newDatail = newDatail.map((item) => {
        if (
          item?.type === contentItem.type &&
          JSON.stringify(item.position) === JSON.stringify(contentItem.position)
        ) {
          const isHeader = isMarkdownHeader(value);
          const res = splitMarkdownHeader(value);
          return {
            ...item,
            text: value,
            ...(isHeader
              ? {
                  text: res!.text,
                  outline_level: isHeader ? res!.hashes.length - 1 : -1,
                }
              : {}),
          };
        }
        return item;
      });
      return {
        ...pre,
        detail_new: newDatail,
        markdown_new: markdown,
      };
    });
  };

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
    rawResultJson,
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
    markdownMode,
    setMarkdownMode,
    updateResultJson,
    markdownEditorRef,
    showModifiedMarkdown,
    setShowModifiedMarkdown,
    showAutoSave,
    autoSaveMarkdown,
    shouldSaveMarkdown,
    setAutoSaveMarkdown,
    saveResultJson,
    resultJsonSaveLoading,
  };
};
export const storeContainer = createContainer(useStore);
