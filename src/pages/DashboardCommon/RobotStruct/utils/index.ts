import { cloneDeep } from 'lodash';
import type { IItemList } from '../data';

export const getItemListCopyContent = (itemList: IItemList[], separate: string = '') => {
  return itemList.reduce((pre, cur) => {
    if (cur.key === 'stamp' && cur.description) {
      const key = cur.description ? cur.description.trim() : cur.key;
      const stampType = cur.stampType ? '类型' : '';
      const color = cur.color ? '颜色' : '';
      const stampShape = cur.stamp_shape ? '形状' : '';
      const value = cur.value ? '内容' : '';
      if (key || value) {
        const str =
          `${key ? key : ''}${''}\n` +
          `${stampType ? stampType + separate : ''}${cur.stampType}\n` +
          `${color ? color + separate : color}${cur.color}\n` +
          `${stampShape ? stampShape + separate : stampShape}${cur.stamp_shape}\n` +
          `${value ? value + separate : value}${cur.value.trim()}\n`;
        return pre + str;
      }
      return pre;
    } else {
      const key = cur.description ? cur.description.trim() : cur.key;
      const value = cur.value.trim() || '';
      if (key || value) {
        return pre + `${key ? key + separate : ''} ${value}\n`;
      }
      return pre;
    }
  }, '');
};

/**
 * category one_to_one/item_list
 * 兼容历史格式 item_list/table_list/details
 */
export const pickResultFromChange = (originData: any, { itemList, tableList, service }: any) => {
  const result = cloneDeep(originData);
  try {
    if (itemList?.length) {
      if (Array.isArray(result.item_list)) {
        const indexMap = itemList.reduce(
          (pre: any, cur: any) => ({ ...pre, [cur._origin_index]: cur }),
          {},
        );
        result.item_list.forEach((item: any, index: number) => {
          if (!indexMap[index]) return;
          if (service === 'plate_number') {
            item.number = indexMap[index]?.value;
          } else {
            item.value = indexMap[index]?.value;
          }
        });
      } else if (result.details) {
        if (result.category) {
          // category one_to_one
          itemList.forEach((item: any) => {
            result.details[item.key].value = item.value;
          });
        } else {
          const details = itemList.reduce((pre: any, cur: any) => {
            const res = { ...pre };
            if (Array.isArray(result.details[cur.key])) {
              if (Array.isArray(res[cur.key])) {
                res[cur.key].push(cur);
              } else {
                res[cur.key] = [cur];
              }
            } else {
              res[cur.key] = cur;
            }
            return res;
          }, {});
          for (const key in details) {
            if (Object.prototype.hasOwnProperty.call(details, key)) {
              if (Array.isArray(result.details[key])) {
                result.details[key].forEach((item: any, index: number) => {
                  if (!details[key]) return;
                  if (service === 'recognize_stamp') {
                    item.value = details[key][index * 2]?.value;
                  } else {
                    item.value = details[key][index]?.value;
                  }
                });
              } else if (details[key]) {
                result.details[key].value = details[key]?.value;
              }
            }
          }
        }
      }
    }
    if (tableList?.length) {
      result.table_list.forEach((row: any, index: number) => {
        if (Array.isArray(tableList[index])) {
          tableList[index].forEach((item: any) => {
            if (row[item._origin_index]) {
              row[item._origin_index].value = item.value;
            }
          });
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
  return result;
};
