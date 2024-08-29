import lodash from 'lodash';

export interface IRectItem {
  type?: string;
  position: number[];
  text: string;
  content_id: number | string;
  image_url?: string;
  outline_level?: number;
  angle?: number;
}

export const formatResult = (res: any, dataType?: string): IRectItem[][] | undefined => {
  if (Array.isArray(res.detail)) {
    let isFromZero = false;
    const metrics = Array.isArray(res.metrics)
      ? res.metrics.reduce(
          (pre: any, cur: { page_id: any }) => ({ ...pre, [cur.page_id]: cur }),
          {},
        )
      : {};
    const pageRects = res.detail.reduce((pre: Record<string, any>, cur: any, idx: number) => {
      if (cur.page_id === 0) {
        isFromZero = true;
      }
      const page_num = isFromZero ? cur.page_id : cur.page_id - 1;
      if (!pre[page_num]) {
        pre[page_num] = [];
      }
      // 过滤 content:1 非正文内容
      if (cur.content === 1) return pre;
      if (dataType) {
        if (dataType === 'table' && cur.type !== 'table') return pre;
        if (dataType === 'image' && cur.type !== 'image') return pre;
        if (dataType === 'formula' && !cur.tags?.includes('formula')) return pre;
      }
      const row = lodash.pick(cur, ['type', 'position', 'text', 'image_url', 'outline_level']);
      if (metrics[cur.page_id]) {
        Object.assign(row, lodash.pick(metrics[cur.page_id], ['angle']));
      }
      pre[page_num].push({ ...row, content_id: idx });
      return pre;
    }, []);
    const catalog = Array.isArray(res.catalog?.generate) ? res.catalog.generate : [];
    for (let index = 0; index < catalog.length; index += 1) {
      const item = catalog[index];
      const dataIndex = item.pageNum; // 从0开始
      if (typeof item.pageNum === 'number' && Array.isArray(pageRects[dataIndex])) {
        pageRects[dataIndex].push({
          type: 'catalog',
          position: item.pos,
          content_id: 'catalog' + index,
        });
      }
    }
    return pageRects;
  }
  return undefined;
};
