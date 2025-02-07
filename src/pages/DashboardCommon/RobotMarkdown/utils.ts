import lodash from 'lodash';
import { ResultType } from './containers/RightView/RightView';

export interface IRectItem {
  [key: string]: any;
  type?: string;
  sub_type?: string;
  position: number[];
  text: string;
  content_id: number | string;
  image_url?: string;
  outline_level?: number;
  angle?: number;
  render_text?: string;
  cells?: { cells: any[]; [key: string]: any };
  custom_edit_continue?: boolean; // 编辑产生的字段, 区分引擎返回的continue
  custom_edit_continue_content_ids?: number[]; // 编辑产生的字段,
}

export const formatResult = (
  res: any,
  dataType?: ResultType,
  options?: Record<string, any>,
): IRectItem[][] | undefined => {
  const metrics = Array.isArray(res.metrics)
    ? res.metrics.reduce((pre: any, cur: { page_id: any }) => ({ ...pre, [cur.page_id]: cur }), {})
    : {};
  if (dataType && [ResultType.handwriting, ResultType.formula].includes(dataType)) {
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
            if (
              (line.sub_type === 'handwriting' && dataType === ResultType.handwriting) ||
              (line.sub_type === 'formula' && dataType === ResultType.formula)
            ) {
              const row = { text: line.text, position: line.pos, type: 'paragraph' };
              if (metrics[cur.page_id] && options?.angle !== false) {
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
  let tablesFromPages: Record<string, any> = {};
  if (
    dataType &&
    [ResultType.md, ResultType.table, ResultType.json].includes(dataType) &&
    Array.isArray(res.pages)
  ) {
    tablesFromPages = res.pages.reduce((pre: Record<string, any>, cur: any) => {
      if (!pre[cur.page_id]) pre[cur.page_id] = [];
      if (Array.isArray(cur.structured)) {
        for (const row of cur.structured) {
          if (row.type === 'table') {
            let col_index = 0;
            let pre_row = 0;
            pre[cur.page_id].push({
              ...row,
              cells: row.cells.map((item: any) => {
                if (item.col === 0 || item.row !== pre_row) col_index = 0;
                pre_row = item.row;
                const cell = { ...item, col_index, row_index: item.row };
                col_index += 1;
                cell.position = cell.pos;
                delete cell.pos;
                cell.cell_id = setCellId(cell);
                return cell;
              }),
              page_id: cur.page_id,
            });
          }
        }
      }
      return pre;
    }, {});
  }
  if (Array.isArray(res.detail)) {
    let isFromZero = false;
    const splitMap: Record<string, any> = {};
    const pageRects = res.detail.reduce((pre: Record<string, any>, cur: any, idx: number) => {
      if (cur.page_id === 0) {
        isFromZero = true;
      }
      // debugger
      const page_num = isFromZero ? cur.page_id : cur.page_id - 1;
      if (!pre[page_num]) {
        pre[page_num] = [];
      }
      if (dataType) {
        if (dataType === 'table' && cur.type !== 'table') return pre;
        if (dataType === 'image' && cur.type !== 'image') return pre;
        if (['formula', 'handwriting'].includes(dataType) && !cur.tags?.includes(dataType))
          return pre;
        if (dataType === ResultType.header_footer && cur.content !== 1) return pre;
      }
      const row = lodash.pick(cur, [
        'type',
        'sub_type',
        'position',
        'text',
        'image_url',
        'base64str',
        'outline_level',
        'split_section_page_ids',
        'split_section_positions',
        'custom_edit_continue',
        'custom_edit_continue_content_ids',
      ]) as IRectItem;
      Object.assign(row, { content_id: idx });
      if (cur.content === 1) {
        Object.assign(row, { sub_type: cur.sub_type, content: cur.content, type: 'other' });
      }
      if (metrics[cur.page_id] && options?.angle !== false) {
        Object.assign(row, lodash.pick(metrics[cur.page_id], ['angle']));
      }
      if (row.custom_edit_continue) {
        return pre;
      }
      // 单元格
      if (cur.type === 'table' && cur.cells && tablesFromPages[cur.page_id]) {
        const cellItem = tablesFromPages[cur.page_id].find(
          (item: any) => item.id === cur.paragraph_id,
        );
        Object.assign(row, { cells: cellItem });
        if (cur.split_section_positions) {
          const allPages = [...new Set(cur.split_section_page_ids)].reduce(
            (pre: any[], page: any) => {
              return [...pre, ...(tablesFromPages[page] || [])];
            },
            [],
          );
          const tableIndex = allPages.findIndex((item: any) => item.id === cur.paragraph_id);
          if (tableIndex > -1) {
            Object.assign(row, {
              split_cells: allPages.slice(
                tableIndex,
                tableIndex + cur.split_section_positions.length,
              ),
            });
          }
        }
      }
      // 内容合并
      if (cur.split_section_page_ids && cur.split_section_positions) {
        const rectPosition = String(cur.position);
        let table_rows = 0;
        for (let idx = 0; idx < cur.split_section_page_ids.length; idx++) {
          const splitPage = cur.split_section_page_ids[idx];
          if (
            !(splitPage === cur.page_id && idx === 0)
            // !(
            //   splitPage === cur.page_id && String(cur.split_section_positions[idx]) === rectPosition
            // )
          ) {
            if (!splitMap[splitPage]) splitMap[splitPage] = [];
            const newPosition = cur.split_section_positions[idx] || [];
            const newRow: Record<string, any> = {
              ...lodash.omit(row, [
                'split_cells',
                'split_section_page_ids',
                'split_section_positions',
              ]),
              position: newPosition,
              points: newPosition,
              _from_split: true,
            };
            if (row.split_cells && row.split_cells[idx]) {
              newRow.cells = row.split_cells[idx];
              if (idx > 0) {
                // eslint-disable-next-line @typescript-eslint/no-loop-func
                newRow.cells.cells.forEach((cell: any) => {
                  const plusRow = cell.row + table_rows;
                  cell.row_index = plusRow;
                  cell.row = plusRow;
                  cell.cell_id = setCellId(cell); // 合并表格，重新设置cell_id
                });
              }
            }
            splitMap[splitPage].push(newRow);
          }
          table_rows += row.split_cells ? row.split_cells[idx]?.rows || 0 : 0;
        }
      }
      pre[page_num].push(row);
      return pre;
    }, []);
    for (let index = 0; index < pageRects.length; index++) {
      if (!Array.isArray(pageRects[index])) pageRects[index] = [];
      if (splitMap[index + 1]) {
        pageRects[index].unshift(...splitMap[index + 1]);
      }
    }
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
      const catalog = res.catalog.toc.filter(
        (item: any) => !['image_title', 'table_title'].includes(item.sub_type),
      );
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
    return pageRects || [];
  }
  return undefined;
};

export const jsonToMarkdown = (json: IRectItem[]) => {
  let markdown = '';
  json.forEach((item) => {
    if (!item) {
      return;
    }
    const text = item.text || '';
    if (item.type === 'image') {
      markdown += `![${text}](${item.image_url})\n\n`;
    } else if (item.type === 'table') {
      markdown += `${text || ''}\n\n`;
    } else if (item.type === 'formula') {
      markdown += `$${text}$`;
    } else if (item.type === 'paragraph' && (item.outline_level || 0) >= 0) {
      markdown += `${'#'.repeat((item.outline_level || 0) + 1)} ${text}\n\n`;
    } else if (['catalog'].includes(item.type as string) || item.content === 1) {
      // markdown中不包含目录，非正文内容
    } else {
      markdown += `${text}\n\n`;
    }
  });
  return markdown;
};

export function splitMarkdownHeader(markdown: string) {
  // 使用正则表达式匹配 Markdown 标题，允许标题中包含换行
  const headerRegex = /^(#+)\s*([\s\S]+?)$/;
  const match = markdown.match(headerRegex);

  if (match) {
    const hashes = match[1]; // 获取#号部分
    const text = match[2]; // 获取标题文字部分
    return { hashes, text };
  } else {
    return null; // 如果不是有效的Markdown标题，返回null
  }
}

export function isMarkdownHeader(markdown: string) {
  // 定义正则表达式来匹配 Markdown 标题，允许标题中包含换行
  const headerRegex = /^#+\s+[\s\S]+/;
  return headerRegex.test(markdown);
}

// export function splitMarkdownHeader(markdown: string) {
//   // 使用正则表达式匹配 Markdown 标题
//   const str = markdown.replace(/\n/g, '');
//   const headerRegex = /^(#+)\s*(.+)$/;
//   const match = str.match(headerRegex);

//   if (match) {
//     const hashes = match[1]; // 获取#号部分
//     const text = match[2]; // 获取标题文字部分
//     return { hashes, text };
//   } else {
//     return null; // 如果不是有效的Markdown标题，返回null
//   }
// }

// export function isMarkdownHeader(markdown: string) {
//   // 定义正则表达式来匹配 Markdown 标题
//   const headerRegex = /^#+\s+.+/;
//   return headerRegex.test(markdown);
// }

export const setCellId = (cell: any) => {
  return `${cell.row_index}_${cell.col_index}_cell_${cell.row}_${cell.row_span}_cell_${cell.col}_${cell.col_span}`;
};
