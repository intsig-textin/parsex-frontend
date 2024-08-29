import { cloneDeep } from 'lodash';
import { generateUUID } from '@/utils';
import type { IImgResult } from '../data';

export const formatDetails = (details?: Record<string, any>, category?: Record<string, any>) => {
  if (!details) return [];
  if (category) {
    return Object.entries(details).reduce(
      (pre, cur) => {
        const key = cur[0];
        const val: any = cur[1];
        if (category[key] === 'one_to_one') {
          pre.oneToOne.push({ ...val, key });
        } else if (category[key] === 'item_list' && Array.isArray(val)) {
          val.forEach((valItem) => ({ ...valItem, key }));
          pre.itemList.push(...val);
        }
        return pre;
      },
      { oneToOne: [], itemList: [] } as any,
    );
  } else {
    const list = Object.entries(details).map((arr) => {
      if (arr[1]?.constructor === Object) {
        return { key: arr[0], ...arr[1] };
      }
      if (Array.isArray(arr[1])) {
        return arr[1].map((item) => ({ ...item, key: arr[0] }));
      }
      return arr[1];
    });
    return { oneToOne: list };
  }
};

export const formatImageProperty = (image_property?: Record<string, any>) => {
  if (!image_property) return [];
  const result: any[] = [];
  if (Array.isArray(image_property)) {
    image_property.forEach((item) => {
      if (item.detect_risk?.risk_type) {
        result.push({
          description: 'risk_type',
          value: item.detect_risk.risk_type,
          key: 'risk_type',
        });
      }
      if (item.detect_risk?.risk_details) {
        const list = Object.entries(item.detect_risk.risk_details).map((arr: [string, any]) => {
          return { description: arr[0], value: arr[1]?.key, key: arr[0] };
        });
        result.push(...list);
      }
    });
  } else if (typeof image_property === 'object') {
    Object.entries(image_property).map((item) => {
      const values = Object.entries(item[1]).filter((row) =>
        ['string', 'number', 'boolean'].includes(typeof row[1]),
      );
      const list = values.map((arr) => {
        return { description: arr[0], value: arr[1], key: item[0] };
      });
      result.push(...list);
    });
  }
  return result;
};

export const formatByService = (data: any[], service: string, originData: any) => {
  let tempList = data;
  if (service === 'recognize_stamp') {
    // 印章检测
    tempList = tempList.reduce((pre, temp) => {
      const list = temp.reduce((preTemp: any, item: any, index: number) => {
        return [
          ...preTemp,
          {
            ...item,
            uid: `text-${index}`,
            description: `stamp ${index + 1}`,
            value: item.value,
            stampType: item?.type,
          },
        ];
      }, []);
      return [...pre, ...list];
    }, []);
  } else if (service.includes('manipulation_detection')) {
    // ps检测
    tempList.forEach((temp) => {
      if (temp.description === 'is_tampered') {
        temp.value = temp.value || temp.value ? '有篡改' : '无篡改';
      }
      if (temp.description === 'image') {
        temp.description = '';
      }
    });
  } else if (service === 'plate_number') {
    // 车牌号
    tempList.forEach((temp) => {
      temp.description = temp.type || '';
      temp.value = temp.number || '';
    });
  } else if (service === 'qr_code') {
    // 二维码
    tempList.forEach((temp) => {
      temp.description = temp.description || '内容';
    });
  } else if (service === 'face_forgery_detection') {
    // 人脸伪造
    tempList = [];
    tempList.push({
      description: 'is_fake',
      value: originData?.is_fake?.value ? '是伪造' : '非伪造',
    });
    tempList.push({
      description: 'has_face',
      value: originData?.has_face?.value ? '存在人脸' : '不存在人脸或者检测不到人脸',
    });
  } else if (service === 'face_attack_detection') {
    // 人脸攻击
    tempList = [];
    tempList.push({
      description: '是否为攻击图像',
      value: originData?.is_attack?.value ? '是攻击图像' : '不是攻击图像',
    });
    tempList.push({ description: '人脸攻击预测置信度', value: originData?.confidence?.value });
  } else if (service && ['image_risk_detect', 'image_quality_inspect'].includes(service)) {
    // 图像质量检测
    const labelMap: Record<string, string> = {
      un_integrity: '完整风险',
      light_spot: '光斑',
      blurry: '是否模糊',
      photocopy: '是否复印',
      screen_remark: '是否翻拍',
      risk_type: '风险项',
    };
    const valueMap: Record<string, string> = {
      true: '是',
      false: '否',
    };
    tempList.forEach((temp) => {
      if (temp.description === 'risk_type') {
        temp.value =
          Array.isArray(temp.value) && temp.value.length
            ? temp.value.map((label: string) => labelMap[label]).join()
            : '无风险';
      }
      if (labelMap[temp.description.toLowerCase()]) {
        temp.description = labelMap[temp.description.toLowerCase()];
      }
      if (typeof temp.value === 'string' && valueMap[temp.value.toLowerCase()]) {
        temp.value = valueMap[temp.value.toLowerCase()];
      }
    });
  }
  return tempList;
};

export const formatDataList = (resultData: any) => {
  if (!Array.isArray(resultData)) return [];
  const itemList: any[] = [];
  resultData.forEach((item: any, index) => {
    const value = String(item.value || '');
    const row = {
      ...item,
      uid: generateUUID(),
      active: false,
      type: value.indexOf('/9j/') === 0 || value.indexOf('iVBORw0KGgo') === 0 ? 'img' : 'text',
      points: item.position?.slice(0, 8),
      description: item.description || item.key || '',
      _origin_index: index,
    };
    itemList.push(row);
  });
  return sortList(itemList);
};

export const sortList = (list: any[]) => {
  return list
    .map((item) => ({
      ...item,
      value: [null, undefined].includes(item.value) ? '' : String(item.value),
    }))
    .sort((a, b) => {
      if (a.value && !b.value) {
        return -1;
      } else if (!a.value && b.value) {
        return 1;
      }
      return 0;
    });
};

export const formatResult = (ocrResult?: IImgResult | null, service: string = '') => {
  if (!ocrResult) return { tempList: [], itemList: [] };
  const result = cloneDeep(ocrResult);
  try {
    let tempList: any[] = []; // key/value
    let itemList: any[] = []; // table
    if (result?.details) {
      // details数据结构
      const { oneToOne, itemList: tableList } = formatDetails(result?.details, result?.category);
      tempList.push(...oneToOne);
      if (Array.isArray(tableList)) itemList.push(...tableList);
    }
    if (result?.image_property) {
      // image_property数据结构
      const list = formatImageProperty(result?.image_property);
      tempList.push(...list);
    }
    if (result?.item_list?.length) {
      tempList.push(...result?.item_list);
    }
    if (result?.table_list?.length) {
      itemList.push(...result?.table_list);
    }

    tempList = formatDataList(formatByService(tempList, service, result));
    itemList = itemList.map((row) => formatDataList(row));

    return { tempList, itemList };
  } catch (error) {
    console.error(error);
    return { tempList: [], itemList: [] };
  }
};
