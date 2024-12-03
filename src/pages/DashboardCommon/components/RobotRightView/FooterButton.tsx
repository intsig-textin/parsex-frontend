import { useState } from 'react';
import { Button, message, Space } from 'antd';
import Icon from '@ant-design/icons';
import md5 from 'md5';
import type { IExportTypeItem } from '@/components/ExportModal/Index';
import TextinToolTip from '@/components/TextinToolTip';
import ExportModal from '@/components/ExportModal/Index';
import { ReactComponent as DownloadIcon } from '@/assets/robot/btn-download.svg';
import styles from './FooterButton.less';
import { downloadFile, getDownloadName, replaceFileSuffixName } from '@/utils';
import { useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import ParamsSettings from '../ParamsSettings';

const noop = () => {};

interface IProps {
  disabled: boolean; // 是否可用
  type: string; // 批量或者单个
  showEdit?: boolean; // 是否展示编辑按钮
  showCopy: boolean; // 是否展示复制按钮
  downloadData?: any; // 下载数据
  showFeedback?: boolean; // 是否展示问题反馈
  showSettings?: boolean;
  textList?: any;
  robotName?: string; // 机器人名称
  exportTypes: IExportTypeItem[]; // 导出类型
  onCopyResult?: () => void;
  onExport?: (key?: string) => void;
  externalExport?: any;
  currentFile?: any;
  currentTab?: string;
  markdownMode?: 'view' | 'edit';
  setMarkdownMode?: React.Dispatch<React.SetStateAction<'view' | 'edit'>>;
  shouldSaveMarkdown?: boolean;
  saveResultJson?: (silent?: boolean) => Promise<void>;
}
const FooterButton = ({
  disabled,
  type,
  showEdit = false,
  showCopy,
  showFeedback = true,
  showSettings,
  downloadData,
  exportTypes,
  robotName: propsName,
  textList = [],
  onCopyResult = noop,
  onExport,
  externalExport,
  currentFile,
  currentTab,
  markdownMode,
  setMarkdownMode,
  shouldSaveMarkdown,
  saveResultJson,
}: IProps) => {
  const [downLoading, setDownLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const [saveLoading, setSaveLoading] = useState(false);

  const saveMarkdown = async () => {
    setSaveLoading(true);
    try {
      if (shouldSaveMarkdown) {
        // await saveResultJson?.(false);
      }
      setMarkdownMode?.('view');
    } catch (error) {
      console.log(error);
    }
    setSaveLoading(false);
  };

  const onClickExportResult = async (key: string) => {
    setShowExportModal(false);
    setDownLoading(true);
    if (externalExport) {
      await externalExport(key);
      setDownLoading(false);
      return;
    }
  };

  return (
    <>
      <ExportModal
        visible={showExportModal}
        exportTypes={exportTypes}
        onCancel={() => {
          setShowExportModal(!showExportModal);
        }}
        resultExport={onClickExportResult}
      />
      <Space size={12} className={styles.footer}>
        {showEdit &&
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
          ))}
        {showSettings && <ParamsSettings />}

        {showCopy && (
          <Button
            type="default"
            disabled={disabled}
            onClick={() => {
              onCopyResult?.();
            }}
          >
            复制结果
          </Button>
        )}

        <Button
          onClick={async () => {
            if (typeof onExport === 'function') {
              setDownLoading(true);
              try {
                await onExport();
              } catch (error) {
                console.log('文件下载失败', error);
                message.warn('文件下载失败');
              }
              setDownLoading(false);
            } else {
              setShowExportModal(true);
            }
          }}
          type="primary"
          loading={downLoading}
          className={showCopy ? 'ant-btn-export' : 'ant-btn-export ant-btn-table-export'}
          disabled={disabled}
          icon={<Icon component={DownloadIcon} />}
        >
          {type ? '批量导出' : '导出结果'}
        </Button>
      </Space>
    </>
  );
};

export default FooterButton;
