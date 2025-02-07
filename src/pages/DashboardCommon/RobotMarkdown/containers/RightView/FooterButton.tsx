import { useState, useEffect, useMemo } from 'react';
import { Button, message, Modal } from 'antd';
// import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import PQueue from 'p-queue';
import JSZip from 'jszip';
import { flatten } from 'lodash';
import {
  base64ToBlob,
  copy,
  downloadFile,
  getDownloadName,
  replaceFileSuffixName,
  requestWidthCache,
} from '@/utils';
import type { IFileItem } from '../../data';
import Footer from '@/pages/DashboardCommon/components/RobotRightView/FooterButton';
import { storeContainer } from '../../store';
import { ResultType } from './RightView';
import { loadXLSX } from '@/utils/xlsx';
import { jsonToMarkdown } from '../../utils';
import TextinToolTip from '@/components/TextinToolTip';

interface IProps {
  current: IFileItem;
  // 左侧批量选中的列表
  currentChoosenList: any;
  titleName: string;
  currentTab: ResultType;
  disabled?: boolean;
  service: string;
  markdown?: boolean;
  showCopy?: boolean;
  showEdit?: boolean;
}

const mdTypes = [
  {
    text: 'md',
    key: 'md',
  },
  {
    text: 'txt',
    key: 'txt',
  },
];

export const FooterButton = ({
  current,
  currentChoosenList,
  titleName,
  currentTab,
  showCopy = true,
  showEdit = false,
}: IProps) => {
  const {
    resultJson,
    rawResultJson,
    showModifiedMarkdown,
    markdownEditorRef,
    currentFile,
    markdownMode,
    setMarkdownMode,
    shouldSaveMarkdown,
    saveResultJson,
  } = storeContainer.useContainer();

  const [wordLoading, setWordLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const saveMarkdown = async () => {
    setSaveLoading(true);
    try {
      if (shouldSaveMarkdown) {
        await saveResultJson?.(false);
      }
      setMarkdownMode?.('view');
    } catch (error) {
      console.log(error);
    }
    setSaveLoading(false);
  };

  const resultExportType = useMemo(() => {
    if (rawResultJson?.doc_base64 && !currentChoosenList.length) {
      return [...mdTypes, { text: 'docx', key: ResultType.doc_base64 }];
    }
    return mdTypes;
  }, [rawResultJson, currentChoosenList]);

  const getMarkdownContent = () => {
    if (showModifiedMarkdown && markdownEditorRef.current) {
      return jsonToMarkdown(flatten(currentFile.newRects));
      // return markdownEditorRef.current!.html2md(
      //   document.getElementById('markdownContent')!.innerHTML,
      // );
    }
    return resultJson?.markdown;
  };

  // 是否可以批量导出
  const [canBathcnExport, setCanBathcnExport] = useState(false);
  // 是否可以单张导出
  const [canExport, setCanExport] = useState(false);

  const resultExport = async (key?: string) => {
    const typeMap: Record<string, string> = {
      [ResultType.table]: 'xlsx',
      [ResultType.formula]: 'md',
      [ResultType.handwriting]: 'md',
      [ResultType.image]: 'zip',
      [ResultType.header_footer]: 'md',
    };
    const filetype = key || typeMap[currentTab] || currentTab;
    const filename: string = current?.name
      ? replaceFileSuffixName(current.name, filetype)
      : getDownloadName(titleName, filetype);

    if (key === ResultType.doc_base64) {
      const blob = base64ToBlob(rawResultJson.doc_base64);
      downloadFile(blob, filename);
    } else if ([ResultType.md, ResultType.json].includes(currentTab)) {
      if (currentChoosenList.length) {
        // 批量导出
      } else {
        const content =
          currentTab === ResultType.json ? JSON.stringify(rawResultJson) : getMarkdownContent();
        const blob = new Blob([content], {
          type: `text/${filetype}`,
        });
        downloadFile(blob, filename);
      }
    } else if (currentTab === ResultType.table) {
      if (rawResultJson?.excel_base64) {
        const blob = base64ToBlob(rawResultJson.excel_base64);
        downloadFile(blob, filename);
      } else {
        const tables = document.querySelectorAll('.result-content-body table');
        if (tables.length) {
          const confirm = await new Promise((resolve) => {
            Modal.confirm({
              centered: true,
              title: '提示',
              content:
                '当前未启用后端生成Excel功能（get_excel），继续使用前端导出可能会影响效果。是否确认继续？',
              onOk: () => {
                resolve(true);
              },
              onCancel: () => {
                resolve(false);
              },
            });
          });
          if (!confirm) return;
          const XLSX = await loadXLSX();
          const wb = XLSX.utils.book_new();
          for (const table of tables) {
            const ws = XLSX.utils.table_to_sheet(table, { raw: true });
            XLSX.utils.book_append_sheet(wb, ws);
          }
          const wb_out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          saveAs(new Blob([wb_out], { type: 'application/octet-stream' }), filename);
        } else {
          message.warning('没有内容可导出');
        }
      }
    } else if (currentTab === ResultType.formula) {
      const formulaDoms = document.querySelectorAll<HTMLElement>(
        '.result-content-body .formula-item',
      );
      let content = '';
      if (formulaDoms) {
        for (const formulaItem of formulaDoms) {
          if (formulaItem.dataset.content) {
            content += '$' + formulaItem.dataset.content + '$\n';
          }
        }
      }
      if (!content) {
        message.warning('没有内容可导出');
        return;
      }
      const blob = new Blob([content], {
        type: `text/${filetype}`,
      });
      downloadFile(blob, filename);
    } else if (currentTab === ResultType.image) {
      const urls: string[] = [];
      if (Array.isArray(current?.rects)) {
        for (const page of current.rects) {
          if (Array.isArray(page)) {
            for (const line of page) {
              if (line.image_url) {
                urls.push(line.image_url);
              }
            }
          }
        }
      }
      const zip = new JSZip();
      const imgFolder = zip.folder('images');
      const queue = new PQueue({ concurrency: 5 });
      for (let index = 0; index < urls.length; index += 1) {
        queue.add(async () => {
          try {
            const imgBlob = await requestWidthCache.get(urls[index], {
              responseType: 'blob',
              prefix: '',
            });
            imgFolder?.file(
              `${filename.replace(/\.[a-z]+$/i, '')}_image_${index + 1}.png`,
              imgBlob,
            );
          } catch (error) {
            console.log('img download error', error);
          }
        });
      }

      if (!urls.length) {
        message.warning('没有内容可导出');
        return;
      }

      await new Promise((resolve) => {
        queue.on('idle', async () => {
          const blob = await zip.generateAsync({ type: 'blob' });
          saveAs(blob, filename);
          resolve(true);
        });
      });
    } else {
      const text: any[] = [];
      if (Array.isArray(current.rects)) {
        for (const page of current.rects) {
          if (Array.isArray(page)) {
            for (const line of page) {
              if (line.text) text.push(line.text);
            }
          }
        }
      }
      if (!text.length) {
        message.warning('没有内容可导出');
        return;
      }
      const blob = new Blob([text.join('\n')], {
        type: `text/${filetype}`,
      });
      downloadFile(blob, filename);
    }
  };

  /**
   * 复制识别结果
   */
  const resultCopy = () => {
    if (currentTab === ResultType.json) {
      copy(JSON.stringify(rawResultJson));
    } else {
      copy(getMarkdownContent());
    }
    message.success('复制成功', 1);
  };

  useEffect(() => {
    // 只要多选列表，即可导出
    if (currentChoosenList.length && [ResultType.md, ResultType.json].includes(currentTab)) {
      // 选中文件大于1，则可以批量导出
      setCanExport(false);
      setCanBathcnExport(true);
    } else if ([ResultType.md].includes(currentTab)) {
      setCanBathcnExport(false);
      setCanExport(!!resultJson?.markdown);
    } else if ([ResultType.json].includes(currentTab)) {
      setCanBathcnExport(false);
      setCanExport(!!resultJson);
    } else if ([ResultType.image].includes(currentTab)) {
      setCanExport(
        Array.isArray(current?.rects) &&
          current.rects.some(
            (page) =>
              !!page?.filter(
                (i: any) => !['catalog'].includes(i.type) && (i.base64str || i.image_url),
              )?.length,
          ),
      );
      setCanBathcnExport(false);
    } else {
      setCanExport(
        Array.isArray(current?.rects) &&
          current.rects.some(
            (page) => !!page?.filter((i: any) => !['catalog'].includes(i.type))?.length,
          ),
      );
      setCanBathcnExport(false);
    }
  }, [current, resultJson, currentChoosenList, currentTab]);

  const onExportWord = async () => {
    setWordLoading(true);
    await resultExport(ResultType.doc_base64);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setWordLoading(false);
  };

  return (
    <>
      <Footer
        currentTab={currentTab}
        disabled={!canBathcnExport && !canExport}
        showFeedback={false}
        showSettings={false}
        robotName={titleName}
        exportTypes={resultExportType}
        exportButtonText={currentTab === ResultType.table ? '导出Excel' : undefined}
        onCopyResult={resultCopy}
        showCopy={showCopy}
        type={canBathcnExport ? 'batch' : ''}
        onExport={currentTab === ResultType.md ? undefined : resultExport}
        externalExport={resultExport}
        currentFile={current}
        startExtra={
          showEdit &&
          (markdownMode === 'view' ? (
            <Button style={{ width: 82 }} onClick={() => setMarkdownMode?.('edit')}>
              编辑
            </Button>
          ) : (
            <TextinToolTip
              title={currentFile?.isExample ? '对示例样本的修改仅在当前页面显示，不会永久保存' : ''}
            >
              <Button type="primary" onClick={saveMarkdown} loading={saveLoading}>
                完成编辑
              </Button>
            </TextinToolTip>
          ))
        }
        endExtra={
          rawResultJson?.doc_base64 && (
            <Button
              onClick={onExportWord}
              type="primary"
              loading={wordLoading}
              // icon={<Icon component={DownloadIcon} style={{ fontSize: '18px' }} />}
            >
              快速导出Word
            </Button>
          )
        }
      />
    </>
  );
};

export default FooterButton;
