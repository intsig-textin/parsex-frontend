import lodash from 'lodash';

export interface IRectItem {
  type?: string;
  position: number[];
  text: string;
  content_id: number | string;
  image_url?: string;
  outline_level?: number;
  angle?: number;
  render_text?: string;
}

export const formatResult = (res: any, dataType?: string): IRectItem[][] | undefined => {
  const metrics = Array.isArray(res.metrics)
    ? res.metrics.reduce((pre: any, cur: { page_id: any }) => ({ ...pre, [cur.page_id]: cur }), {})
    : {};
  if (dataType && ['handwriting'].includes(dataType)) {
    if (Array.isArray(res.pages)) {
      let isFromZero = false;
      const pageRects = res.pages.reduce((pre: Record<string, any>, cur: any, idx: number) => {
        if (cur.page_id === 0) {
          isFromZero = true;
        }
        const page_num = isFromZero ? cur.page_id : cur.page_id - 1;
        if (!pre[page_num]) {
          pre[page_num] = [];
        }
        if (Array.isArray(cur.content)) {
          for (const line of cur.content) {
            if (line.sub_type === 'handwriting') {
              const row = { text: line.text, position: line.pos, type: dataType };
              if (metrics[cur.page_id]) {
                Object.assign(row, lodash.pick(metrics[cur.page_id], ['angle']));
              }
              pre[page_num].push({ ...row, content_id: `${idx}_${line.id}` });
            }
          }
        }
        return pre;
      }, []);
      return pageRects;
    }
  }
  if (Array.isArray(res.detail)) {
    let isFromZero = false;
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
        if (['formula', 'handwriting'].includes(dataType) && !cur.tags?.includes(dataType))
          return pre;
      }
      const row = lodash.pick(cur, ['type', 'position', 'text', 'image_url', 'outline_level']);
      if (metrics[cur.page_id]) {
        Object.assign(row, lodash.pick(metrics[cur.page_id], ['angle']));
      }
      pre[page_num].push({ ...row, content_id: idx });
      return pre;
    }, []);
    // 目录
    if (Array.isArray(res.catalog?.generate)) {
      const catalog = res.catalog.generate;
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
    } else if (Array.isArray(res.catalog?.toc)) {
      const catalog = res.catalog.toc;
      for (let index = 0; index < catalog.length; index += 1) {
        const item = catalog[index];
        const dataIndex = item.page_id - 1; // 从1开始
        if (typeof item.page_id === 'number' && Array.isArray(pageRects[dataIndex])) {
          pageRects[dataIndex].push({
            type: 'catalog',
            position: item.pos || item.position,
            content_id: 'catalog' + index,
          });
        }
      }
    }
    return pageRects;
  }
  return undefined;
};

export const jsonToMarkdown = (json: IRectItem[]) => {
  let markdown = '';
  json.forEach((item) => {
    const text = item.text || '';
    if (item.type === 'image') {
      markdown += `![${text}](${item.image_url})\n\n`;
    } else if (item.type === 'table') {
      markdown += `${text || ''}\n\n`;
    } else if (item.type === 'formula') {
      markdown += `$${text}$`;
    } else if (item.type === 'paragraph' && (item.outline_level || 0) >= 0) {
      markdown += `${'#'.repeat((item.outline_level || 0) + 1)} ${text}\n\n`;
    } else if (item.type === 'catalog') {
      //
    } else {
      markdown += `${text}\n\n`;
    }
  });
  return markdown;
};

export function splitMarkdownHeader(markdown: string) {
  // 使用正则表达式匹配 Markdown 标题
  const str = markdown.replace(/\n/g, '');
  const headerRegex = /^(#+)\s*(.+)$/;
  const match = str.match(headerRegex);

  if (match) {
    const hashes = match[1]; // 获取#号部分
    const text = match[2]; // 获取标题文字部分
    return { hashes, text };
  } else {
    return null; // 如果不是有效的Markdown标题，返回null
  }
}

export function isMarkdownHeader(markdown: string) {
  // 定义正则表达式来匹配 Markdown 标题
  const headerRegex = /^#+\s+.+/;
  return headerRegex.test(markdown);
}
