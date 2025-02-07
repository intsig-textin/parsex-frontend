import type { ReactText } from 'react';
import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import ProList from '@ant-design/pro-list';
import Empty from '@/components/Empty/Index';
import File from './File/Index';
import { IFileItem } from '../../data.d';
import useTimeout from 'ahooks/lib/useTimeout';
import { fileContainer, listContainer } from '../../store';
import nonPayImg from '@/assets/images/pic_non_file@2x.png';
import styles from './Index.less';
import classNames from 'classnames';
import { setPDFCache } from '../../utils/cachePDF';

export { IFileItem };

export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const { list: dataSource, containerRef } = listContainer.useContainer();

  const {
    keepLoadingSelected,
    curFileActiveId,
    isSelectAll,
    rowSelected,
    handleCheckFileClick,
    handleFileSelectChange,
    setIndeterminate,
    handleCheckChange,
  } = fileContainer.useContainer();

  // 用于解决首次空列表闪烁
  const [didReq, setDidReq] = useState(false);
  useTimeout(() => {
    setDidReq(true);
  }, 300);

  // 全选,与反选
  useEffect(() => {
    let keys: any = [];

    if (keepLoadingSelected) {
      keys = selectedRowKeys;
    }
    if (isSelectAll) {
      keys = dataSource.map((item) => item.id);
    }
    setSelectedRowKeys(keys);
  }, [isSelectAll, keepLoadingSelected]);

  // 取消多选
  useEffect(() => {
    if (!rowSelected) {
      setSelectedRowKeys([]);
    }
  }, [rowSelected]);

  // 选中 dataSource
  useEffect(() => {
    const rows = dataSource.filter((item) => selectedRowKeys.includes(item.id));
    handleFileSelectChange(rows);
  }, [selectedRowKeys]);
  useEffect(() => {
    if (selectedRowKeys.length > 0 && dataSource.length > selectedRowKeys.length) {
      setIndeterminate(true);
    }
  }, [dataSource, selectedRowKeys]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: ReactText[]) => {
      setSelectedRowKeys(keys);
      if (keys.length === dataSource.length) {
        setIndeterminate(false);
        handleCheckChange(true);
      } else if (!keys.length) {
        handleCheckChange(false);
        setIndeterminate(false);
      } else {
        setIndeterminate(true);
      }
    },
  };

  return (
    <div ref={containerRef} className={classNames(styles.leftBarMain, 'normalFileList')}>
      <div className={styles.robotFileListContainer}>
        <ProList<IFileItem>
          rowSelection={rowSelected ? rowSelection : false}
          dataSource={dataSource}
          rowKey="id"
          split={false}
          toolBarRender={false}
          pagination={false}
          bordered={false}
          className="ListContainer"
          tableAlertRender={false}
          locale={{
            emptyText: didReq ? (
              <Empty
                containerHeight={300}
                src={nonPayImg}
                title="暂未上传过任何文件"
                desc="点击上传文件试试吧"
              />
            ) : (
              <></>
            ),
          }}
          metas={{
            content: {
              render: (_, row, index) => (
                <File
                  {...row}
                  active={curFileActiveId === row.id}
                  onClick={handleCheckFileClick}
                  onLoad={(e: any) => {
                    if (e.blob && row.id) {
                      setPDFCache(row.id, e.blob);
                    }
                  }}
                  priority={1000 - index}
                  index={index}
                />
              ),
            },
          }}
        />
      </div>
    </div>
  );
};
