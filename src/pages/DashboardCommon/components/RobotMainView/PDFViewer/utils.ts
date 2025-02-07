export const resultClass = 'result-content-body';

interface ICell {
  [key: string]: any;
  row_index: number;
  col_index: number;
  row: number;
  row_span: number;
  col: number;
  col_span: number;
}

export const scrollToResultTarget = (detail?: {
  [key: string]: any;
  pageNumber?: any;
  contentId?: any;
  cell?: ICell;
  scrollOption?: ScrollIntoViewOptions;
  onlyScroll?: boolean;
}) => {
  const target = document.querySelector(`.${resultClass}`);
  if (target && detail) {
    const scrollOption: ScrollIntoViewOptions = detail.scrollOption || {
      block: 'nearest',
      inline: 'nearest',
    };
    let relatedDom = target.querySelector<HTMLParagraphElement>(
      `[data-content-id="${detail.contentId}"]`,
    );
    if (!relatedDom) {
      const elements = document.querySelectorAll<HTMLParagraphElement>(
        '[data-custom-edit-continue-content-ids]',
      );
      const filteredElements = Array.from(elements).filter((element) => {
        const ids = element.getAttribute('data-custom-edit-continue-content-ids')?.split(',');
        return (ids || []).includes(detail.contentId);
      });
      relatedDom = filteredElements[0];
    }

    if (relatedDom) {
      if (!detail.onlyScroll) {
        const oldActiveDoms = target.querySelectorAll(`[data-content-id].active`);
        if (oldActiveDoms) {
          oldActiveDoms.forEach((item) => {
            if (item !== relatedDom) {
              item.classList.remove('active');
            }
          });
        }
        const oldCells = target.querySelectorAll(`tr .active`);
        oldCells.forEach((item) => {
          item.classList.remove('active');
        });

        relatedDom.classList.add('active');
      }

      // 滚动到视口
      relatedDom.scrollIntoView(scrollOption);

      const cellInfo = detail.cell;
      if (
        cellInfo &&
        typeof cellInfo.row_index === 'number' &&
        typeof cellInfo.col_index === 'number'
      ) {
        const isMdTable = relatedDom.querySelector('.md-table');
        const trs = relatedDom.querySelectorAll('tr');
        const cellGroup = document.querySelector(
          `#imgContainer .cell-g-wrapper[data-content-id="${detail.contentId}"]`,
        );
        if (isMdTable) {
          const activeTr = [...trs].slice(cellInfo.row, cellInfo.row + cellInfo.row_span);
          const cells: Element[] = [];
          activeTr.forEach((tr) => {
            Array.from(tr.children).forEach((cell, cellIndex) => {
              if (cellIndex >= cellInfo.col && cellIndex < cellInfo.col + cellInfo.col_span) {
                cells.push(cell);
              }
            });
          });
          if (cells.length) {
            cells[0].scrollIntoView(scrollOption);

            if (!detail.onlyScroll) {
              cells.forEach((cell) => {
                if (
                  (cell.tagName === 'TD' || cell.tagName === 'TH') &&
                  !cellGroup?.classList.contains('cell-g-hidden')
                ) {
                  cell.classList.add('active');
                }
              });
            }
          }
        } else {
          const activeTr = trs[cellInfo.row_index];
          let cell = activeTr?.children[cellInfo.col_index];
          if (!cell) {
            cell = activeTr;
          }
          if (cell) {
            cell.scrollIntoView(scrollOption);

            if (
              !detail.onlyScroll &&
              (cell.tagName === 'TD' || cell.tagName === 'TH') &&
              !cellGroup?.classList.contains('cell-g-hidden')
            ) {
              cell.classList.add('active');
            }
          }
        }
      }

      const input = relatedDom.querySelector<HTMLDivElement>('.custom-textarea');
      if (input) {
        input.focus();
      }
    }
  }
  return target;
};

export const removeCellActive = (wrapper: SVGGElement) => {
  if (wrapper.classList.contains('cell-g-hidden')) {
    const oldSvgCells = wrapper.querySelectorAll(`path.active`);
    if (oldSvgCells.length) {
      oldSvgCells.forEach((cell) => {
        cell.classList.remove('active');
      });
      const oldTableCells = document.querySelectorAll(`.${resultClass} tr .active`);
      oldTableCells.forEach((cell) => {
        cell.classList.remove('active');
      });
    }
  }
};

export const getCellId = (id?: string) => {
  if (!id) return undefined;
  try {
    // `${content_id}_${cell.row_index}_${cell.col_index}_cell_${cell.row}_${cell.row_span}_cell_${cell.col}_${cell.col_span}`
    const [[row_index, col_index], [row, row_span], [col, col_span]] = id
      .split('_cell_')
      .slice(1)
      .map((item) => item.split('_').map(Number));
    return { row_index, col_index, row, row_span, col, col_span };
  } catch (error) {
    console.log('getCellId error:', error, id);
  }
  return undefined;
};

export const getPageNumberFromActiveContent = () => {
  const activeContentList = document.querySelectorAll<HTMLElement>(`.${resultClass} .active`);
  let activeContent: HTMLElement | null = activeContentList[activeContentList.length - 1];
  let page;
  while (activeContent) {
    if (activeContent?.dataset.pageNumber) {
      page = Number(activeContent.dataset.pageNumber);
      break;
    } else {
      activeContent = activeContent.parentElement;
    }
  }
  return page;
};
