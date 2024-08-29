import { useState } from 'react';
import { Button, message, Space } from 'antd';
import Icon from '@ant-design/icons';
import md5 from 'md5';
import type { IExportTypeItem } from '@/components/ExportModal/Index';
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
  showCopy: boolean; // 是否展示复制按钮
  downloadData?: any; // 下载数据
  showFeedback?: boolean; // 是否展示问题反馈
  showSettings?: boolean;
  textList?: any;
  robotName?: string; // 机器人名称
  exportTypes: IExportTypeItem[]; // 导出类型
  onCopyResult?: () => void;
  onExport?: () => void;
  externalExport?: any;
  currentFile?: any;
  currentTab?: string;
}
const FooterButton = ({
  disabled,
  type,
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
}: IProps) => {
  const [downLoading, setDownLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const onClickExportResult = async (key: string) => {};

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
