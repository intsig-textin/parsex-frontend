/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Button, Modal, Radio } from 'antd';
import styles from './Index.less';

interface IExportTypeItem {
  text: string;
  key: string;
  tip?: string;
}

export { IExportTypeItem };

interface IExportModal {
  // 支持导出的类型
  exportTypes: IExportTypeItem[];
  // 控制是否显示
  visible: boolean;
  // 取消操作函数
  onCancel: () => void;
  // 导出数据的处理函数
  resultExport: (dataType: string, resultType?: number) => void;
}

const CONTENT = (
  <div className={styles.popover}>
    <p style={{ borderRadius: '8px' }}>
      导出时检测每个文件是否有100%专家识别结果，如果包含100%专家识别结果则优先导出100%专家识别结果，如果没有则导出该文件的OCR结果
    </p>
  </div>
);

const ExportModal = (props: IExportModal) => {
  const { exportTypes, visible, onCancel, resultExport } = props;

  // 当前选中的导出文件类型
  const [dataType, setDataType] = useState('');

  // 导出结果类型 1、仅ocr，2、仅精准识别，3、OCR和精准识别
  const [resultType, setResultType] = useState(1);

  useEffect(() => {
    if (exportTypes) {
      setDataType(exportTypes[0].key);
    }
  }, []);

  const onChangeType = (type: string) => {
    setDataType(type);
  };

  return (
    <>
      <Modal
        closable={false}
        width={'430px'}
        className={styles.exportModal}
        // 水平垂直居中
        centered={true}
        visible={visible}
        destroyOnClose={true}
        onCancel={() => {
          // 关闭弹窗恢复默认选项
          setDataType(exportTypes[0].key);
          setResultType(3);
          onCancel();
        }}
        footer={[
          <Button
            className={styles.exportbtn}
            key="back"
            onClick={() => {
              // 关闭弹窗恢复默认选项
              setDataType(exportTypes[0].key);
              setResultType(3);
              onCancel();
            }}
            style={{ color: '#4877FF' }}
          >
            取消
          </Button>,
          <Button
            className={styles.exportbtn}
            key="submit"
            type="primary"
            onClick={() => {
              // 关闭弹窗恢复默认选项
              setDataType(exportTypes[0].key);
              setResultType(3);
              resultExport(dataType, resultType);
            }}
          >
            导出
          </Button>,
        ]}
      >
        <div>
          {/* 导出格式 */}
          <div className={styles.exportTitle} style={{ marginTop: 0 }}>
            导出格式
          </div>
          <div className={styles.exportDetail}>
            <Radio.Group
              className={styles.exportType}
              value={dataType}
              onChange={(e) => onChangeType(e.target.value)}
            >
              {exportTypes.map((item) => {
                return (
                  <Radio className={styles.radioStyle} value={item.key} key={item.key}>
                    <span style={{ marginLeft: '4px' }}>
                      {item.text}
                      <span style={{ opacity: 0.68 }}>{item.tip || ''}</span>
                    </span>
                  </Radio>
                );
              })}
            </Radio.Group>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExportModal;
