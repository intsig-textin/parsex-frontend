import { fileContainer, listContainer } from '../../store';
import ProList from '@ant-design/pro-list';
import RobotInfoTile from '../../components/FileListHeader/RobotSettingInfo';
import ThumbImg from '../../components/ThumbImg/Index';
import styles from './Index.less';
import type { IFileItem } from '../../data.d';
import { useSelector } from 'dva';
import type { ConnectState } from '@/models/connect';
import ThumbFooterView from '../ThumbFooterView/Index';
import type { ReactText } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Checkbox } from 'antd';
import classNames from 'classnames';
import { FileStatus } from '@/components/FileStatus/Index';
import { useScroll } from 'ahooks';
import classnames from 'classnames';
export default function Index() {
  const { fileSaveFlag } = useSelector((store: ConnectState) => ({
    fileSaveFlag: store.User.file_save,
  }));
  const { top } = useScroll(document.querySelector('.fileList') as HTMLElement);
  const { list: dataSource, loading, containerRef } = listContainer.useContainer();

  const {
    curFileActiveId,
    handleCheckFileClick,
    rowSelected,
    keepLoadingSelected,
    isSelectAll,
    handleCheckChange,
    handleFileSelectChange,
    setIndeterminate,
  } = fileContainer.useContainer();
  const [selectedRowKeys, setSelectedRowKeys] = useState<ReactText[]>([]);
  // const rowSelection = {
  //   selectedRowKeys,
  //   // onChange: (keys: ReactText[]) => {
  //   //   setSelectedRowKeys(keys);
  //   // },
  // }
  useEffect(() => {
    if (dataSource.length > selectedRowKeys.length && selectedRowKeys.length > 0) {
      setIndeterminate(true);
    }
  }, [dataSource, selectedRowKeys]);
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
  const handleSelectChange = (keys: any[]) => {
    setSelectedRowKeys(keys);
    if (keys.length === dataSource.length) {
      handleCheckChange(true);
      setIndeterminate(false);
    } else if (!keys.length) {
      handleCheckChange(false);
      setIndeterminate(false);
    } else {
      setIndeterminate(true);
    }
  };
  // useEffect(()=>{
  //   if(!rowSelected){
  //     setSelectedRowKeys([])
  //   }
  // },[rowSelected])
  useEffect(() => {
    const rows = dataSource.filter((item) => selectedRowKeys.includes(item.id!));
    handleFileSelectChange(rows);
  }, [selectedRowKeys]);
  return (
    <div ref={containerRef} className={styles.leftBarMain}>
      <div className={classnames({ [styles.scroll_effect]: top > 0 })}>
        <div className={styles.title}>
          {fileSaveFlag ? (
            '我的文件'
          ) : (
            <>
              临时文件
              <RobotInfoTile />
            </>
          )}
        </div>
        <div className={classNames(styles.upload_btn)}>
          <ThumbFooterView />
        </div>
      </div>

      <div className="fileList">
        <Checkbox.Group value={selectedRowKeys} onChange={handleSelectChange}>
          <ProList<IFileItem>
            dataSource={dataSource}
            rowKey="id"
            // rowSelection={rowSelected?rowSelection:false}
            split={false}
            grid={{
              gutter: 0,
              column: 1,
            }}
            pagination={false}
            bordered={false}
            tableAlertRender={false}
            toolBarRender={false}
            className="imgContainer"
            locale={{ emptyText: <></> }}
            // cardProps={false}
            renderItem={(row, idx) => {
              return (
                <div
                  className={classNames('imgItemWrap', {
                    'last-item': idx === dataSource.length - 1,
                  })}
                  key={row.id}
                >
                  <div className={'fileStatus'}>
                    <FileStatus {...row} />
                  </div>
                  {rowSelected && (
                    <div className={'rowSelection'}>
                      <Checkbox value={row.id} />
                    </div>
                  )}
                  <ThumbImg
                    {...row}
                    number={idx + 1}
                    active={curFileActiveId === row.id}
                    onClick={handleCheckFileClick}
                  />
                </div>
              );
            }}
            loading={loading}
          />
        </Checkbox.Group>
      </div>
    </div>
  );
}
