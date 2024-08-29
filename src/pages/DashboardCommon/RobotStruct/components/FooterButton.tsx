import { useState, useEffect } from 'react';
import { downloadRobotFile, batchDownloadRobotFile } from '@/services/robot';
import type { IFileItem } from '../data';
import { message } from 'antd';
import md5 from 'md5';
import { replaceFileSuffixName, downloadFile, getDownloadName, copy } from '@/utils';
import Footer from '../../components/RobotRightView/FooterButton';
import { storeContainer } from '../store';
import { ResultType } from '../../components';

const SEPARATE = ':';

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
// 文件导出类型
const exportTypes = [
  {
    text: 'excel',
    key: 'batch_xls',
    tip: '（合并结果）',
  },
  {
    text: 'doc',
    key: 'doc',
  },
  {
    text: 'json',
    key: 'json',
  },
  {
    text: 'excel',
    key: 'xls',
    tip: '（独立结果）',
  },
  {
    text: 'docx',
    key: 'docx',
  },
  {
    text: 'pdf',
    key: 'pdf',
  },
  {
    text: 'txt',
    key: 'txt',
  },
  {
    text: 'csv',
    key: 'csv',
  },
];
const mdTypes = [
  {
    text: 'md',
    key: 'md',
    result_type: 4,
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
  service,
  markdown,
  showCopy = true,
}: IProps) => {
  // 是否可以批量导出
  const [canBathcnExport, setCanBathcnExport] = useState(false);
  const { itemList, tableList, generateCopyContent, resultJson } = storeContainer.useContainer();
  // 是否可以单张导出
  const [canExport, setCanExport] = useState(false);
  const isMarkdown = markdown || ['pdf_to_markdown'].includes(service);
  const typeList: any[] = isMarkdown ? mdTypes : exportTypes;

  const resultExport = (key: string, resultType: number = 1) => {
    return new Promise((resolve) => {
      let filetype = key;
      // 单张导出 && 兼容样例导出
      if (current.isExample || canExport) {
        // 兼容
        if (filetype === 'batch_xls') {
          filetype = 'xls';
        }
        let content;
        const filename: string = current?.name
          ? replaceFileSuffixName(current.name, filetype)
          : getDownloadName(titleName, filetype);
        if (filetype === 'json') {
          content = JSON.stringify(resultJson);
        } else if (isMarkdown) {
          content = resultJson?.markdown;
          const blob = new Blob([String.fromCharCode(0xfeff), content], {
            type: `text/${filetype}`,
          });
          downloadFile(blob, filename);
          resolve('');
          return;
        } else if (filetype !== 'csv') {
          content = generateCopyContent({
            separate: SEPARATE,
            isExport: true,
          });
        } else {
          // csv
          // 兼容windows content为空导出有乱码
          if (!content) {
            content = ' ';
          }
          // resultItemList, key!, currentTab, ','
          content = generateCopyContent({
            separate: ',',
            isExport: true,
          });
          if (itemList?.length || tableList?.length) {
            const extraContent = '字段名,信息内容\n';
            content = extraContent + content;
          }
          const blob = new Blob([String.fromCharCode(0xfeff), content], {
            type: 'text/csv',
          });
          downloadFile(blob, filename);
          resolve('');
          return;
        }

        downloadRobotFile({
          filename: `${md5(filename)}.${filetype}`,
          content: content!,
        }).then((data) => {
          if (!(data instanceof Blob) || (data instanceof Blob && !data.size)) {
            message.warn('下载失败');
          } else {
            downloadFile(data, filename);
          }
          resolve('');
        });
        return;
      }
      // 批量导出
      if (canBathcnExport) {
        const ids: number[] = [];
        currentChoosenList.forEach((item: any) => {
          ids.push(item.id);
        });
        const result_type =
          typeList.find((item) => item.key === filetype)?.result_type || resultType;
        batchDownloadRobotFile({
          filetype,
          result_type,
          ids,
        }).then((result) => {
          const resultType = filetype === 'batch_xls' ? 'xls' : 'zip';
          const name: string = getDownloadName(titleName, resultType);
          downloadFile(result.data, name, resultType);
          resolve('');
        });
      }
    });
  };

  /**
   * 复制识别结果
   */
  const resultCopy = () => {
    if (isMarkdown) {
      if (currentTab === ResultType.json) {
        copy(JSON.stringify(resultJson));
      } else {
        copy(resultJson?.markdown);
      }
      message.success('复制成功', 1);
      return;
    }
    // resultItemList, key!, currentTab, SEPARATE, true
    const copyContent = generateCopyContent({
      type: currentTab,
      separate: SEPARATE,
      exportBase64: true,
    });
    // 识别结果
    if (copyContent!.length) {
      copy(copyContent!);
      message.success('复制成功', 1);
    } else {
      message.warn('无结果');
    }
  };

  useEffect(() => {
    // 只要多选列表，即可导出
    if (currentChoosenList.length) {
      // 选中文件大于1，则可以批量导出
      setCanExport(false);
      setCanBathcnExport(true);

      // if (service && hiddenBatchButtonServices.indexOf(service) > -1) {
      //   setBatchExportBtnVisible(false);
      // } else {
      //   setBatchExportBtnVisible(true);
      // }
    } else {
      setCanBathcnExport(false);
      // 如果当前选中的有识别结果，可以单独导出
      if (isMarkdown) {
        setCanExport(!!resultJson?.markdown);
      } else if (itemList.length || tableList?.length) {
        setCanExport(true);
      } else {
        setCanExport(false);
      }
    }
  }, [resultJson, itemList, tableList, currentChoosenList]);

  return (
    <>
      <Footer
        disabled={!canBathcnExport && !canExport}
        showFeedback={!isMarkdown}
        showSettings={isMarkdown}
        robotName={titleName}
        exportTypes={typeList}
        onCopyResult={resultCopy}
        showCopy={showCopy}
        type={canBathcnExport ? 'batch' : ''}
        externalExport={resultExport}
        currentFile={current}
      />
    </>
  );
};

export default FooterButton;
