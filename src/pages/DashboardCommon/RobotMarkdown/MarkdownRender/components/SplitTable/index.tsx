import { useMemo, useRef } from 'react';
import { useSize } from 'ahooks';
import CopyWrapper from '../../../containers/CopyWrapper';

const SplitTable = ({ text, data }: { text: string; data: Record<string, any> }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const tableSize = useSize(tableRef);

  const { lines, left } = useMemo(() => {
    if (tableSize && tableRef.current && data?.split_section_page_ids && data?.split_cells) {
      const trs = [...tableRef.current.querySelectorAll('tr')];
      const result: any[] = [];
      let rows = 0;
      for (let index = 0; index < data.split_cells.length; index++) {
        const tableItem = data.split_cells[index];
        const top: number =
          trs.slice(rows, rows + tableItem.rows).reduce((pre, cur) => pre + cur.offsetHeight, 0) +
          (index ? result[index - 1].top : 0);
        if (index === data.split_cells.length - 1) continue;
        result.push({ key: index, page: data.split_section_page_ids[index], top });
        rows += tableItem.rows;
      }
      return {
        lines: result,
        left: String(Math.max(...data.split_section_page_ids)).length * 7,
      };
    }
    return { lines: [], left: undefined };
  }, [tableSize, data]);

  return (
    <>
      <div className="content-container" style={{ marginLeft: left, position: 'relative' }}>
        <CopyWrapper />
        <div ref={tableRef} dangerouslySetInnerHTML={{ __html: text || '' }} />
      </div>
      {lines.map((item) => (
        <div key={item.key} className="split-table-line" style={{ top: item.top }}>
          <span className="split-table-line-number">第{item.page}页</span>
        </div>
      ))}
    </>
  );
};

export default SplitTable;
