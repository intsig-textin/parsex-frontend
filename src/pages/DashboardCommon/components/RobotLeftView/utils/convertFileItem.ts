import { notSupportPreView } from '@/utils';
import { convertTime } from '@/utils/day';
import { CROP_VALUE } from '../constants';
import type { IFileItem } from '../data.d';
import type { IListItem } from '../service';
import { imageUrl } from '@/utils';

const DEFAULT_PDF__URL = `${imageUrl}?filename=170abe38-a3e8-11eb-9fcf-525400a064a3`;

export const convertFileItem = ({ ocr_status = 1, ...item }: IListItem): IFileItem => {
  let img_name = item.img_name;
  if (item.img_name.length >= 64) {
    // img_name超长时会被截取，后缀缺失，取img_uri中的后缀
    const suffix = /\.[a-zA-z]+$/.test(item.img_uri) ? '.' + item.img_uri.split('.').pop() : '';
    img_name = item.img_name.replace(/(\.[a-zA-z]*)?$/, suffix);
  }
  return {
    id: item.id,
    name: img_name,
    url: notSupportPreView(img_name) ? DEFAULT_PDF__URL : item.img_uri,
    thumbnail: notSupportPreView(img_name)
      ? DEFAULT_PDF__URL
      : `${item.img_uri}&crop=${CROP_VALUE}`, // 使用原图链接增加裁剪参数
    cloudOcr: item.cloud_ocr === 1,
    cloudStatus: item.status,
    time: convertTime(item.ctime),
    status: ocr_status === 1 ? 'complete' : 'wait',
  };
};

export const isDoc = (name: string) => /\.doc[x]?$/i.test(name);
