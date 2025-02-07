import { useEffect, useMemo, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import lodash, { cloneDeep } from 'lodash';
import type Vditor from 'vditor';
import type { IFileItem, IImgResult, IItemList, IRectListItem, KeyTypeEnum } from '../data';
import type { IRectItem } from '../../RobotMarkdown/utils';
import { isMarkdownHeader, jsonToMarkdown, splitMarkdownHeader } from '../../RobotMarkdown/utils';
import { getParamsSettings } from '../../components/ParamsSettings/utils';

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

  const saveResultJson = async (silent = true) => {};

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

  const rawResultJson = useMemo(() => {
    if (!resultJson) return {};
    const jsonData = lodash.omit(lodash.cloneDeep(resultJson), [
      'dpi',
      'remove_watermark',
      'crop_enhance',
      'detail_new',
      'markdown_new',
    ]);
    if (showModifiedMarkdown) {
      jsonData.detail = resultJson.detail_new || resultJson.detail;
      jsonData.markdown = resultJson.markdown_new || jsonToMarkdown(jsonData.detail);
    }
    const params = getParamsSettings();
    if (params?.page_details === 0) {
      delete jsonData.pages;
    }
    if (['none', 'objects'].includes(params?.get_image)) {
      if (Array.isArray(jsonData.pages)) {
        jsonData.pages.forEach((page: any) => {
          page.image_id = '';
        });
      }
      if (Array.isArray(jsonData.metrics)) {
        jsonData.metrics.forEach((page: any) => {
          page.image_id = '';
        });
      }
    }
    return jsonData;
  }, [resultJson, showModifiedMarkdown]);

  // 更新json结果
  const updateResultJson = ({ value, contentItem, markdown }: ResultJsonUpdateParams) => {
    setResultJson((pre) => {
      let newDatail = cloneDeep([...(pre?.detail_new || pre?.detail)]);
      newDatail = newDatail.map((item, index) => {
        if (
          item?.type === contentItem.type &&
          String(item.position) === String(contentItem.position)
        ) {
          const isHeader = isMarkdownHeader(value);
          const res = splitMarkdownHeader(value);
          const text = isHeader ? res!.text : value;

          // 合并
          if (contentItem.custom_edit_continue) {
            let prevItemIndex = index - 1;
            let prevItem = newDatail[prevItemIndex];
            while (
              prevItem?.custom_edit_continue ||
              prevItem?.content === 1 ||
              prevItem?.type !== 'paragraph'
            ) {
              prevItemIndex = prevItemIndex - 1;
              prevItem = newDatail[prevItemIndex];
            }

            if (prevItem) {
              prevItem.custom_edit_continue_content_ids = [
                ...(prevItem.custom_edit_continue_content_ids || []),
                contentItem.content_id,
              ];
              prevItem.text = (prevItem.text?.trimEnd() || '') + text;
            }
          }
          return {
            ...item,
            ...contentItem,
            text,
            ...(isHeader
              ? {
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
