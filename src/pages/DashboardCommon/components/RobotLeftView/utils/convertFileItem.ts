import { notSupportPreView } from '@/utils';
import { convertTime } from '@/utils/day';
import { CROP_VALUE } from '../constants';
import type { IFileItem } from '../data.d';
import type { IListItem } from '../service';
import { imageUrl } from '@/utils';

const DEFAULT_PDF__URL = `${imageUrl}?filename=170abe38-a3e8-11eb-9fcf-525400a064a3`;

export const isThumbnailId = (thumbnail: any) => /^[a-z0-9]+(\.[a-z]+)?$/i.test(thumbnail);

export const convertFileItem = (
  { ocr_status = 1, ...item }: IListItem,
  status?: IFileItem['status'],
): IFileItem => {
  let img_name = item.img_name;

  return {
    id: item.id,
    name: img_name,
    img_uri: item.img_uri,
    url: notSupportPreView(img_name) ? DEFAULT_PDF__URL : item.img_uri,
    thumbnail_id: isThumbnailId(item.thumbnail) ? item.thumbnail : undefined,
    thumbnail: notSupportPreView(img_name) ? DEFAULT_PDF__URL : item.img_uri,
    cloudOcr: item.cloud_ocr === 1,
    cloudStatus: item.status,
    time: convertTime(item.ctime),
    status: status || (ocr_status === 1 ? 'complete' : 'wait'),
  };
};

export const isDoc = (name: string) => /\.doc[x]?$/i.test(name);
