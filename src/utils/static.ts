import { getTextinPrefix } from './request';

/**
 * 邮箱正则
 */
export const emailRegx = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;

/**
 * 分页设置列表
 */
export const pageSizeOptions = ['10', '20', '30', '50'];

export const defaultPageSize = 10000;
export const imageUrl = `${getTextinPrefix()}/open/image/download`;
export const prefixCls = 'Textin-';
