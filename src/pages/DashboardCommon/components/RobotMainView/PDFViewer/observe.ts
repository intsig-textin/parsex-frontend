import lodash from 'lodash';
import { calcBtnPosition } from '@/components/SvgRect/Cell';
import icon1 from '@/assets/icon/eye-close.png';
import icon2 from '@/assets/icon/icon_eye_on.png';
import {
  scrollToResultTarget,
  resultClass,
  removeCellActive,
  getCellId,
  getPageNumberFromActiveContent,
} from './utils';

const rectClass = 'rectLayer';

interface ICell {
  [key: string]: any;
  cells: { position: number[]; [key: string]: any }[];
}
export interface IRect {
  position: number[];
  type: string;
  content_id: number;
  angle?: number;
  render_text?: string;
  split_section_page_ids?: number[];
  split_section_positions?: number[][];
  split_cells?: ICell[];
  cells?: ICell;
}

let observer: MutationObserver;
let clickBind: (e: any) => void;
let moveBind: (e: any) => void;
let pagechangingBind: (e: any) => void;

const getPoint = ({ e, viewerRef, svgDom }: { e: any; viewerRef: any; svgDom: SVGSVGElement }) => {
  let clickPoint = { x: e.layerX, y: e.layerY };
  let wrapperDom: HTMLElement = e.target;
  let count = 0;
  if (!(wrapperDom.nodeName === 'polygon' && wrapperDom.dataset.contentId)) {
    while (!wrapperDom.classList.contains('textLayer')) {
      clickPoint.x += wrapperDom.offsetLeft;
      clickPoint.y += wrapperDom.offsetTop;
      wrapperDom = wrapperDom.parentElement as HTMLElement;
      count += 1;
      if (count >= 5 || !wrapperDom) {
        break;
      }
    }
  }
  const scale = viewerRef.currentScale;
  const dpiScale = Number(svgDom.dataset.dpiScale) || 1;
  clickPoint.x = clickPoint.x / scale / dpiScale;
  clickPoint.y = clickPoint.y / scale / dpiScale;
  // 有旋转时
  const pageAngle = svgDom.dataset.angle ? Number(svgDom.dataset.angle) : 0;
  const rotate = viewerRef.pagesRotation + pageAngle;
  const viewBox: string = svgDom.getAttribute('viewBox') || '';
  const [_, __, width, height] = viewBox.split(' ').map((i) => Number(i));
  if (width && height) {
    if (rotate === 90) {
      clickPoint = { x: clickPoint.y, y: height - clickPoint.x };
    } else if (rotate === 180) {
      clickPoint = { x: width - clickPoint.x, y: height - clickPoint.y };
    } else if (rotate === 270) {
      clickPoint = { x: width - clickPoint.y, y: clickPoint.x };
    }
  }
  const svgPoint = svgDom.createSVGPoint();
  svgPoint.x = clickPoint.x;
  svgPoint.y = clickPoint.y;

  return svgPoint;
};

const clickHandle = (e: any, { viewerRef }: { viewerRef: any }) => {
  const viewer: HTMLDivElement = e.currentTarget;
  const target: HTMLElement | null = e.target;
  const pages = viewer?.querySelectorAll<HTMLDivElement>('.page[data-loaded="true"]');
  if (!pages || !target) return;
  for (const page of pages) {
    if (page.contains(target)) {
      const svgDom = page.querySelector<SVGSVGElement>(`.${rectClass}`);
      if (!svgDom) continue;
      const svgPoint = getPoint({ e, viewerRef, svgDom });
      for (const chd of svgDom.querySelectorAll('.cell-toggle')) {
        const chdDom = chd as SVGImageElement;
        const wrapper = chdDom.parentElement as SVGGElement | null;
        const { x, y, width, height } = chdDom.getBBox();
        if (
          wrapper &&
          svgPoint.x >= x &&
          svgPoint.x <= x + width &&
          svgPoint.y > y &&
          svgPoint.y <= y + height
        ) {
          wrapper.classList.toggle('cell-g-hidden');
          removeCellActive(wrapper);
          return;
        }
      }
      for (const chd of svgDom.querySelectorAll('polygon')) {
        const chdDom = chd as SVGPolygonElement;
        if (
          chdDom.nodeName === 'polygon' &&
          !chdDom.classList.contains('catalog') &&
          chdDom.isPointInFill(svgPoint)
        ) {
          const oldActivePolygons = viewer.querySelectorAll('polygon.active');
          oldActivePolygons.forEach((item) => {
            item.classList.remove('active');
          });
          const newActivePolygons = viewer.querySelectorAll(
            `polygon[data-content-id="${chdDom.dataset.contentId}"]`,
          );
          newActivePolygons.forEach((item) => {
            item.classList.add('active');
          });
          const detail: Record<string, any> = {
            pageNumber: page.dataset.pageNumber,
            contentId: chdDom.dataset.contentId,
          };
          // 单元格
          const oldCellPaths = viewer.querySelectorAll<SVGPathElement>(
            `.cell-g-wrapper path.active`,
          );
          oldCellPaths.forEach((item) => {
            item.classList.remove('active');
          });
          const cells = svgDom.querySelectorAll<SVGPathElement>(
            `.cell-g-wrapper[data-content-id="${detail.contentId}"] path`,
          );
          for (const cellItem of cells) {
            if (cellItem.isPointInFill(svgPoint)) {
              cellItem.classList.add('active');
              const cell = getCellId(cellItem.dataset.contentId);
              if (cell) {
                detail.cell = cell;
              }
              break;
            }
          }

          const target = scrollToResultTarget(detail);
          if (target) {
            target.dispatchEvent(new CustomEvent('rect-click', { detail }));
          }
          break;
        }
      }

      break;
    }
  }
};

const moveHandle = lodash.throttle((e: any, { viewerRef }: { viewerRef: any }) => {
  const viewer: HTMLDivElement = e.currentTarget;
  const target: HTMLElement | null = e.target;
  const pages = viewer?.querySelectorAll<HTMLDivElement>('.page[data-loaded="true"]');
  if (!pages || !target) return;
  let hoverTarget: SVGGElement | null = null;
  for (const page of pages) {
    if (page.contains(target)) {
      const svgDom = page.querySelector<SVGSVGElement>(`.${rectClass}`);
      if (!svgDom) continue;
      const svgPoint = getPoint({ e, viewerRef, svgDom });
      for (const chdDom of svgDom.querySelectorAll<SVGGElement>('.cell-g-wrapper')) {
        const { x, y, width, height } = chdDom.getBBox();
        if (
          svgPoint.x >= x &&
          svgPoint.x <= x + width &&
          svgPoint.y > y &&
          svgPoint.y <= y + height
        ) {
          hoverTarget = chdDom;
        }
      }

      break;
    }
  }
  const olderHover = viewer.querySelectorAll('.cell-g-wrapper-hover');
  olderHover.forEach((old) => {
    if (old !== hoverTarget) {
      old.classList.remove('cell-g-wrapper-hover');
    }
  });
  hoverTarget?.classList.add('cell-g-wrapper-hover');
}, 32);

export function initObserve({
  target,
  rects,
  viewerRef,
  dpi,
  currentFile,
}: {
  target: any;
  rects?: IRect[][];
  viewerRef?: any;
  dpi?: number;
  currentFile: any;
}) {
  if (!target || !rects || !viewerRef || !MutationObserver) return;
  const pdfViewDpi = 96;
  let resultDpi = dpi || 144;
  let dpiScale = pdfViewDpi / resultDpi;
  // 绘制框
  const createPage = (pageItem: HTMLDivElement, { activeId }: { activeId?: string }) => {
    const page = pageItem.dataset.pageNumber;
    const { clientWidth, clientHeight } = pageItem;
    const scale = viewerRef.currentScale;
    const pageIndex = Number(page) - 1;
    const curPageRects = rects[pageIndex];
    if (!dpi && Array.isArray(currentFile?.result?.pages)) {
      const curPage = currentFile.result.pages[pageIndex] || {};
      if (curPage.ppi && typeof curPage.ppi === 'number') {
        resultDpi = curPage.ppi;
      } else if (typeof curPage.width === 'number' && typeof curPage.height === 'number') {
        let { width: resultWidth, height: resultHeight } = curPage;
        const { viewHeight, viewWidth } = [90, 270].includes(viewerRef.pagesRotation)
          ? { viewHeight: clientWidth, viewWidth: clientHeight }
          : { viewHeight: clientHeight, viewWidth: clientWidth };
        // 判断结果中的width/height是否反了
        const sizeRate = viewWidth / viewHeight;
        if (
          [90, 270].includes(curPage.angle) &&
          Math.abs(curPage.width / curPage.height - sizeRate) > 0.02 &&
          Math.abs(curPage.height / curPage.width - sizeRate) <= 0.02
        ) {
          resultWidth = curPage.height;
          resultHeight = curPage.width;
        }
        resultDpi = Math.round(pdfViewDpi * (resultWidth / (viewWidth / scale)));
      }
      dpiScale = pdfViewDpi / resultDpi;
    }
    if (page && Array.isArray(curPageRects) && curPageRects.length) {
      const oldDom = pageItem.querySelector(`.${rectClass}`);
      if (oldDom) {
        oldDom.remove();
      }
      const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const pageAngle = curPageRects[0].angle || 0;
      const rotate = (viewerRef.pagesRotation + pageAngle) % 360;
      let info = { width: clientWidth, height: clientHeight, translateX: 0, translateY: 0 };
      if (rotate === 90) {
        info = {
          width: clientHeight,
          height: clientWidth,
          translateX: 0,
          translateY: -clientWidth,
        };
      } else if (rotate === 180) {
        info = {
          width: clientWidth,
          height: clientHeight,
          translateX: -clientWidth,
          translateY: -clientHeight,
        };
      } else if (rotate === 270) {
        info = {
          width: clientHeight,
          height: clientWidth,
          translateX: -clientHeight,
          translateY: 0,
        };
      }
      svgDom.setAttribute('data-dpi-scale', `${dpiScale}`);
      svgDom.setAttribute('data-angle', `${pageAngle}`);
      svgDom.setAttribute('class', `${rectClass}`);
      svgDom.setAttribute('width', `${info.width}`);
      svgDom.setAttribute('height', `${info.height}`);
      svgDom.setAttribute(
        'style',
        `transform: rotate(${rotate}deg) translate3d(${info.translateX}px, ${info.translateY}px, 0)`,
      );
      const viewBoxWidth = Number((info.width / scale / dpiScale).toFixed(2));
      const viewBoxHeight = Number((info.height / scale / dpiScale).toFixed(2));
      svgDom.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
      let isOver = false;
      curPageRects.forEach((rect) => {
        if (!rect.position) return;
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute(
          'points',
          rect.position.reduce((pre, cur, i) => pre + (i % 2 ? ',' : ' ') + cur, ''),
        );
        polygon.setAttribute('vector-effect', 'non-scaling-stroke');
        polygon.setAttribute('data-content-id', `${rect.content_id}`);
        if (activeId && activeId === `${rect.content_id}`) {
          polygon.classList.add('active');
        }
        if (rect.type) {
          polygon.classList.add(rect.type);
        }
        const textScale = 1 / scale / dpiScale;
        if (rect.render_text) {
          const renderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          const translateScale = (1 - textScale) / textScale;
          renderGroup.setAttribute(
            'style',
            `transform: scale(${textScale}) translate(${rect.position[0] * translateScale}px, ${
              rect.position[1] * translateScale
            }px)`,
          );
          const renderRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          const attr1: any = {
            width: '16',
            height: '16',
            fill: '#4877FF',
            x: `${rect.position[0]}`,
            y: `${rect.position[1]}`,
          };
          for (const attr in attr1) {
            renderRect.setAttribute(attr, attr1[attr]);
          }
          renderGroup.appendChild(renderRect);
          const renderText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          const attr2: any = {
            style: 'font-size: 12px; fill: #fff',
            x: `${rect.position[0] + 4}`,
            y: `${rect.position[1] + 11}`,
          };
          for (const attr in attr2) {
            renderText.setAttribute(attr, attr2[attr]);
          }
          renderText.textContent = rect.render_text;
          renderGroup.appendChild(renderText);
          svgDom.appendChild(renderGroup);
        }
        // table渲染单元格
        if (rect.cells && Array.isArray(rect.cells.cells) && rect.cells.cells.length) {
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('data-content-id', `${rect.content_id}`);
          group.setAttribute('class', 'cell-g-wrapper');
          group.appendChild(polygon);
          for (const cell of rect.cells.cells) {
            if (!cell.position) continue;
            const cellPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            cellPolygon.setAttribute(
              'd',
              `M ${cell.position[0]} ${cell.position[1]} L ${cell.position[2]} ${cell.position[3]} L ${cell.position[4]} ${cell.position[5]} L ${cell.position[6]} ${cell.position[7]} Z`,
            );
            cellPolygon.setAttribute('vector-effect', 'non-scaling-stroke');
            const cellId = `${rect.content_id}_cell_${cell.cell_id}`;
            cellPolygon.setAttribute('data-content-id', cellId);
            if (activeId && activeId === cellId) {
              cellPolygon.classList.add('active');
            }
            if (rect.type) {
              cellPolygon.classList.add(rect.type);
            }
            group.appendChild(cellPolygon);
          }
          const position = calcBtnPosition({ viewRate: textScale, points: rect.position });
          const imgAttrs = [
            { class: 'cell-toggle cell-toggle-hidden', href: icon1 },
            { class: 'cell-toggle cell-toggle-show', href: icon2 },
          ];
          for (const imgItem of imgAttrs) {
            const imgDom = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            imgDom.setAttribute('class', imgItem.class);
            imgDom.setAttribute('href', imgItem.href);
            imgDom.setAttribute('x', `${position.x}`);
            imgDom.setAttribute('y', `${position.y}`);
            imgDom.setAttribute('width', `${position.size}`);
            imgDom.setAttribute('height', `${position.size}`);
            group.appendChild(imgDom);
          }
          svgDom.appendChild(group);
        } else {
          svgDom.appendChild(polygon);
        }
        if (!isOver) {
          isOver =
            rect.position[2] - viewBoxWidth > 5 ||
            rect.position[4] - viewBoxWidth > 5 ||
            rect.position[5] - viewBoxHeight > 5 ||
            rect.position[7] - viewBoxHeight > 5;
          // console.log('isOver', { rect, viewBoxHeight, viewBoxWidth });
        }
      });
      if (!isOver) {
        pageItem.insertBefore(
          svgDom,
          pageItem.children[1] || pageItem.children[pageItem.children.length - 1],
        );
      }
    }
  };
  // 移除旧框
  const removeHidden = () => {
    const oldDoms: HTMLDivElement[] = target.querySelectorAll(
      `.page:not([data-loaded="true"]) .${rectClass}`,
    );
    oldDoms.forEach((item) => {
      item.remove();
    });
  };

  const handle = (list: any[]) => {
    if (currentFile.hiddenRects) return;
    try {
      if (list.forEach) {
        const activeContent = document.querySelector<SVGPolygonElement>(
          `.${resultClass} .active[data-content-id]`,
        );
        list.forEach((pageItem) => {
          createPage(pageItem, { activeId: activeContent?.dataset.contentId });
        });
      }
      removeHidden();
    } catch (error) {
      console.log('MutationObserver callback error', error);
    }
  };

  // 监听属性data-loaded变化，重新绘制框
  if (observer && observer.disconnect) {
    observer.disconnect();
  }
  function callback(records: MutationRecord[]) {
    const list = records.map ? records.map((item) => item.target) : [];
    handle(list);
  }

  observer = new MutationObserver(callback);
  const config = { attributeFilter: ['data-loaded'], subtree: true };
  observer.observe(target, config);
  // 清楚历史数据
  const oldPages: HTMLDivElement[] = target.querySelectorAll(`.${rectClass}`);
  oldPages.forEach((item) => {
    item.remove();
  });
  const initDoms = target.querySelectorAll('.page[data-loaded="true"]');
  handle(initDoms);

  // 框点击事件
  const viewer = document.querySelector('#viewer');

  if (clickBind) {
    viewer?.removeEventListener('click', clickBind);
  }
  clickBind = (e: any) => {
    try {
      clickHandle(e, { viewerRef });
    } catch (error) {
      console.log('框点击事件error', error);
    }
  };
  viewer?.addEventListener('click', clickBind);

  if (moveBind) {
    viewer?.removeEventListener('mousemove', moveBind);
  }
  moveBind = (e: any) => {
    try {
      moveHandle(e, { viewerRef });
    } catch (error) {
      console.log('mousemove error', error);
    }
  };
  viewer?.addEventListener('mousemove', moveBind);

  // 滚动同步
  if (pagechangingBind) {
    viewerRef.eventBus.off('pagechanging', pagechangingBind);
  }
  pagechangingBind = (params: { pageNumber: number; previous: number }) => {
    const curPageContentList: HTMLElement[] = target.querySelectorAll(
      `.page[data-page-number="${params.pageNumber}"] .${rectClass} [data-content-id]`,
    );
    let curPageFirstContent: HTMLElement | undefined;
    const itemHandle = (item: HTMLElement) => {
      if (
        !curPageFirstContent &&
        !item.classList.contains('catalog') &&
        !item.classList.contains('other')
      ) {
        if (item.classList.contains('cell-g-wrapper')) {
          const firstCell = item.querySelector('path[data-content-id]') as HTMLElement;
          if (firstCell) {
            curPageFirstContent = firstCell;
          }
        } else {
          curPageFirstContent = item;
        }
      }
    };
    if (params.pageNumber > params.previous) {
      for (let index = 0; index < curPageContentList.length; index++) {
        const item = curPageContentList[index];
        itemHandle(item);
        if (curPageFirstContent) break;
      }
    } else {
      for (let index = curPageContentList.length - 1; index > -1; index--) {
        const item = curPageContentList[index];
        itemHandle(item);
        if (curPageFirstContent) break;
      }
    }
    const contentId = curPageFirstContent?.dataset?.contentId;
    if (!curPageFirstContent || !contentId) return;
    const isTableCell =
      curPageFirstContent.tagName.toLowerCase() === 'path' &&
      curPageFirstContent.classList.contains('table');
    const scrollOption: ScrollIntoViewOptions =
      params.pageNumber > params.previous
        ? { block: 'start', inline: 'nearest' }
        : { block: 'end', inline: 'nearest' };
    if (isTableCell) {
      const detail: Record<string, any> = {
        contentId: contentId.split('_cell_')[0],
        pageNumber: params.pageNumber,
        scrollOption,
        onlyScroll: true,
      };
      const cell = getCellId(contentId);
      if (cell) {
        detail.cell = cell;
      }
      scrollToResultTarget(detail);
    } else {
      const targetContent = document.querySelector(
        `.${resultClass} [data-content-id="${contentId}"]`,
      );
      if (targetContent) {
        targetContent.scrollIntoView(scrollOption);
      }
    }
  };
  viewerRef.eventBus.on('pagechanging', pagechangingBind);

  const activePage = getPageNumberFromActiveContent();
  if (typeof activePage === 'number') {
    requestAnimationFrame(() => {
      const targetView = target.querySelector(`[data-page-number="${activePage}"]`);
      targetView?.scrollIntoView();
    });
  }
}
