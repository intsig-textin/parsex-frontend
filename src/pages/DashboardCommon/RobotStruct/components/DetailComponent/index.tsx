import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useState, useMemo } from 'react';
import { Input, Radio } from 'antd';
import { useLocation } from 'umi';
import { message } from 'antd';
import { robotUpdateHistory } from '@/services/robot';
import { storeContainer } from '../../store';
import TableList from '../TableList';
import type { IItemList, IFileItem, IRectListItem } from '../../data';
import { formatResult } from '../../utils/format';
import { pickResultFromChange } from '../../utils';
import Stamp from './Stamp';
import styles from './Index.less';

const { TextArea } = Input;

interface ItemListComponentProps {
  ocrResultList?: IItemList[];
  current: IFileItem;
}

const DetailComponent: FC<ItemListComponentProps> = ({ current }) => {
  const [width, setWidth] = useState<number>();
  const [valueWidth, setValueWidth] = useState<number>();

  const refValue = useRef<any>();

  const {
    currentFile,
    resultJson,
    setResultJson,
    itemList,
    setItemList,
    tableList,
    setTableList,
    curUid,
    setCurUid,
    setRectList,
    multiple,
  } = storeContainer.useContainer();

  const {
    query: { service },
  } = useLocation() as any;

  useEffect(() => {
    const { tempList, itemList } = formatResult(resultJson, service);
    setTableList(itemList);
    setItemList(tempList);

    // 排除坐标有问题的服务
    const needPosition = ['marriage_certificate', 'birth_certificate', 'bank_card'].includes(
      service,
    );

    if (multiple) {
      if (tempList?.length > 1) {
        setRectList(tempList as IRectListItem[]);
        setCurUid(tempList[0]?.uid);
      } else {
        setRectList([]);
        setCurUid('');
      }
    } else if (!needPosition) {
      const rects = [tempList, ...itemList]
        .reduce((pre, cur) => [...pre, ...cur], [])
        .filter((item: any) => item.points && item.points.some((i: any) => i));
      setRectList(rects);
      setCurUid('');
    }
  }, [resultJson, currentFile?.id]);

  useEffect(() => {
    if (curUid) {
      requestAnimationFrame(() => {
        const activeDom = document.querySelector('.result-struct-wrapper .active');
        if (activeDom) {
          activeDom.scrollIntoView({ block: 'nearest' });
        }
        const activeDomInput = document.querySelector<HTMLElement>(
          '.result-struct-wrapper .active .ant-input',
        );
        if (activeDomInput) {
          activeDomInput.focus();
        }
      });
    }
  }, [curUid]);

  // 更新识别结果入库
  const updateResult = () => {
    const newResultJson = pickResultFromChange(resultJson, { itemList, tableList, service });

    // 样例不修改
    if (!current.isExample) {
      // 更新识别结果
      robotUpdateHistory({
        id: current.id,
        type: 1,
        data: newResultJson,
      })
        .then((res) => {
          if (res.code !== 200) {
            message.warning(res.msg);
          }
        })
        .catch((res) => {
          message.error(res.msg);
        })
        .finally(() => {
          // 更新接口返回的识别结果，使得json结果保持同步
          setResultJson(newResultJson);
        });
    }
  };

  const curResultItemList = useMemo(() => {
    if (!multiple) return itemList;
    if (curUid) {
      return itemList.filter((item: any) => item.uid === curUid);
    }
    return itemList;
  }, [itemList, curUid]);

  useEffect(() => {
    if (curResultItemList.length > 0) {
      const arr: any[] = [];
      curResultItemList.forEach((item) => {
        // arr.push(countCharacters(item.description))
        const count: number = countCharacters(item.description || item.key);
        arr.push(count);
      });
      const maxKey = Math.max(...arr);
      const labelWidth = (maxKey + 2) * 6;
      setWidth(labelWidth);
      const domValueWidth = refValue.current ? refValue.current?.offsetWidth : 0;
      setValueWidth(domValueWidth - labelWidth);
    }
  }, [curResultItemList]);

  const countCharacters = (str: string = '') => {
    let totalCount = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
        totalCount++;
      } else {
        totalCount += 2;
      }
    }
    return totalCount;
  };

  const markItemFocus = (uid: string) => {
    setCurUid(uid);
  };

  const renderItemList = (list: IItemList[]) => (
    <div>
      {list.map((item) => {
        if (item.key === 'stamp') {
          if (!item.description) return '';
          return (
            <Stamp
              key={item.uid}
              curUid={curUid}
              item={item}
              width={width}
              valueWidth={valueWidth}
              onClick={() => markItemFocus(item.uid)}
            />
          );
        }
        return (
          <div
            className={`result-struct-item${curUid === item.uid ? ' active' : ''}`}
            key={item.uid}
            data-uid={item.uid}
            onClick={() => markItemFocus(item.uid)}
          >
            <div className="result-struct-key" style={{ width: `${width}px`, minWidth: '100px' }}>
              {item.description}
            </div>
            <div className="result-struct-value" style={{ width: `${valueWidth}px` }}>
              {item.type === 'img' ? (
                <img src={`data:image/jpeg;base64,${item.value}`} alt="" />
              ) : (
                <>
                  <TextArea
                    disabled={item.disabled}
                    autoSize={{ minRows: 1 }}
                    style={{ lineHeight: '18px' }}
                    defaultValue={item.value}
                    onChange={({ target: { value } }) => {
                      item.value = value;
                    }}
                    onFocus={() => {
                      markItemFocus(item.uid);
                    }}
                    onBlur={() => {
                      updateResult();
                    }}
                    // value={item.value ? item.value : ''}
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const splitIndex = useMemo(() => {
    if (!(Array.isArray(tableList) && tableList.length)) return -1;
    return tableList[0].some((i) => i.value)
      ? curResultItemList.findIndex((i) => i.value === '')
      : -1;
  }, [curResultItemList]);

  return (
    <div className="result-struct-wrapper">
      {multiple && itemList.length > 1 && (
        <Radio.Group
          onChange={(e) => setCurUid(e.target.value)}
          value={curUid}
          className="result-radio-group"
        >
          {itemList.map(({ uid }, index) => (
            <Radio.Button key={uid} value={uid}>
              {index + 1}
            </Radio.Button>
          ))}
        </Radio.Group>
      )}
      <div style={{ paddingLeft: 20 }}>
        <div className="result-struct-item result-struct-title" ref={refValue}>
          <div className="result-struct-key" style={{ width: `${width}px`, minWidth: '100px' }}>
            字段名
          </div>
          <div className="result-struct-value" style={{ width: `${valueWidth}px` }}>
            信息内容
          </div>
        </div>
      </div>
      <div className="result-struct-box">
        {renderItemList(curResultItemList.slice(0, splitIndex > 0 ? splitIndex : undefined))}
        <TableList
          tableList={tableList}
          width={width}
          valueWidth={valueWidth}
          className={styles['table-list']}
          curUid={curUid}
          onClick={markItemFocus}
        />
        {splitIndex > 0 && renderItemList(curResultItemList.slice(splitIndex))}
      </div>
    </div>
  );
};

export default DetailComponent;
