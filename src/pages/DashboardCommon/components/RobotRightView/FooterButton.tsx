import { useState } from 'react';
import { Button, message, Row } from 'antd';
import Icon from '@ant-design/icons';
import type { IExportTypeItem } from '@/components/ExportModal/Index';
import ExportModal from '@/components/ExportModal/Index';
import { ReactComponent as DownloadIcon } from '@/assets/robot/btn-download.svg';
import styles from './FooterButton.less';

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
  exportButtonText?: string;
  onCopyResult?: () => void;
  onExport?: () => void;
  externalExport?: any;
  currentFile?: any;
  currentTab?: string;
  startExtra?: any;
  endExtra?: any;
}
const FooterButton = ({
  disabled,
  type,
  showCopy,
  exportTypes,
  exportButtonText,
  onCopyResult = noop,
  onExport,
  externalExport,
  startExtra,
  endExtra,
}: IProps) => {
  const [downLoading, setDownLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const onClickExportResult = async (key: string) => {
    setShowExportModal(false);
    setDownLoading(true);
    // 外部导出函数
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
      <Row style={{ rowGap: 12, columnGap: 12 }} className={styles.footer}>
        {/* 放前面的自定义内容 */}
        {startExtra}

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
          type={endExtra ? 'default' : 'primary'}
          style={{ minWidth: endExtra ? 82 : undefined }}
          loading={downLoading}
          className={showCopy ? 'ant-btn-export' : 'ant-btn-export ant-btn-table-export'}
          disabled={disabled}
          icon={<Icon component={DownloadIcon} />}
        >
          {exportButtonText || (type ? '批量导出' : endExtra ? '导出' : '导出结果')}
        </Button>

        {/* 末尾的自定义内容 */}
        {endExtra}
      </Row>
    </>
  );
};

export default FooterButton;
