import { useState, useEffect } from 'react';
import { message } from 'antd';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import PQueue from 'p-queue';
import JSZip from 'jszip';
import { copy, downloadFile, getDownloadName, replaceFileSuffixName, request } from '@/utils';
import type { IFileItem } from '@/pages/DashboardCommon/RobotStruct/data.d';
import Footer from '@/pages/DashboardCommon/components/RobotRightView/FooterButton';
import { storeContainer } from '@/pages/DashboardCommon/RobotStruct/store';
import { ResultType } from './RightView';

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
}

const mdTypes = [
  {
    text: 'md',
    key: 'md',
  },
  {
    text: 'json',
    key: 'json',
  },
];

export const FooterButton = ({
  current,
  currentChoosenList,
  titleName,
  currentTab,
  showCopy = true,
}: IProps) => {
  const { resultJson } = storeContainer.useContainer();

  // 是否可以批量导出
  const [canBathcnExport, setCanBathcnExport] = useState(false);
  // 是否可以单张导出
  const [canExport, setCanExport] = useState(false);

  const resultExport = async () => {
    const typeMap: Record<string, string> = {
      [ResultType.table]: 'xlsx',
      [ResultType.formula]: 'md',
      [ResultType.image]: 'zip',
    };
    const filetype = typeMap[currentTab] || currentTab;
    const filename: string = current?.name
      ? replaceFileSuffixName(current.name, filetype)
      : getDownloadName(titleName, filetype);

    if ([ResultType.md, ResultType.json].includes(currentTab)) {
      if (currentChoosenList.length) {
      } else {
        const content =
          currentTab === ResultType.json ? JSON.stringify(resultJson) : resultJson?.markdown;
        const blob = new Blob([content], {
          type: `text/${filetype}`,
        });
        downloadFile(blob, filename);
      }
    } else if (currentTab === ResultType.table) {
      const tables = document.querySelectorAll('.result-content-body table');
      if (tables) {
        const wb = XLSX.utils.book_new();
        for (const table of tables) {
          const ws = XLSX.utils.table_to_sheet(table);
          XLSX.utils.book_append_sheet(wb, ws);
        }
        const wb_out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wb_out], { type: 'application/octet-stream' }), filename);
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
      const blob = new Blob([content], {
        type: `text/${filetype}`,
      });
      downloadFile(blob, filename);
    } else {
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
            const imgBlob = await request.get(urls[index], { responseType: 'blob', prefix: '' });
            imgFolder?.file(
              `${filename.replace(/\.[a-z]+$/i, '')}_image_${index + 1}.png`,
              imgBlob,
            );
          } catch (error) {
            console.log('img download error', error);
          }
        });
      }

      await new Promise((resolve) => {
        queue.on('idle', async () => {
          const blob = await zip.generateAsync({ type: 'blob' });
          saveAs(blob, filename);
          resolve(true);
        });
      });
    }
  };

  /**
   * 复制识别结果
   */
  const resultCopy = () => {
    if (currentTab === ResultType.json) {
      copy(JSON.stringify(resultJson));
    } else {
      copy(resultJson?.markdown);
    }
    message.success('复制成功', 1);
  };

  useEffect(() => {
    // 只要多选列表，即可导出
    if (currentChoosenList.length && [ResultType.md, ResultType.json].includes(currentTab)) {
      // 选中文件大于1，则可以批量导出
      setCanExport(false);
      setCanBathcnExport(false);
    } else if ([ResultType.table, ResultType.image, ResultType.formula].includes(currentTab)) {
      setCanExport(Array.isArray(current?.rects) && current.rects.some((page) => !!page?.length));
      setCanBathcnExport(false);
    } else {
      setCanBathcnExport(false);
      setCanExport(!!resultJson?.markdown);
    }
  }, [current, resultJson, currentChoosenList, currentTab]);

  return (
    <>
      <Footer
        currentTab={currentTab}
        disabled={!canBathcnExport && !canExport}
        showFeedback={false}
        showSettings={true}
        robotName={titleName}
        exportTypes={mdTypes}
        onCopyResult={resultCopy}
        showCopy={showCopy}
        type={canBathcnExport ? 'batch' : ''}
        onExport={resultExport}
        currentFile={current}
      />
    </>
  );
};

export default FooterButton;
