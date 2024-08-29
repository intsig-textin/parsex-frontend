const rectClass = 'rectLayer';
const resultClass = 'result-content-body';

const clickHandle = (e: any, { viewerRef, dpiScale }: { viewerRef: any; dpiScale: number }) => {
  const viewer: HTMLDivElement = e.currentTarget;
  const target: HTMLElement | null = e.target;
  const pages = viewer?.querySelectorAll<HTMLDivElement>('.page[data-loaded="true"]');
  if (!pages || !target) return;
  for (const page of pages) {
    if (page.contains(target)) {
      const svgDom = page.querySelector<SVGSVGElement>(`.${rectClass}`);
      if (!svgDom) return;
      let clickPoint = { x: e.layerX, y: e.layerY };
      let wrapperDom: HTMLElement | null = target;
      let count = 0;
      if (!(wrapperDom.nodeName === 'polygon' && wrapperDom.dataset.contentId)) {
        while (!wrapperDom.classList.contains('textLayer')) {
          clickPoint.x += wrapperDom.offsetLeft;
          clickPoint.y += wrapperDom.offsetTop;
          wrapperDom = wrapperDom.parentElement;
          count += 1;
          if (count >= 5 || !wrapperDom) {
            break;
          }
        }
      }
      const scale = viewerRef.currentScale;
      clickPoint.x = clickPoint.x / scale / dpiScale;
      clickPoint.y = clickPoint.y / scale / dpiScale;
      // 有旋转时
      const pageAngle = svgDom.dataset.angle ? Number(svgDom.dataset.angle) : 0;
      const rotate = viewerRef.pagesRotation + pageAngle;
      const viewBox = svgDom.getAttribute('viewBox') || '';
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
      for (const chd of svgDom.childNodes) {
        const chdDom = chd as SVGPolygonElement;
        if (
          chdDom.nodeName === 'polygon' &&
          !chdDom.classList.contains('catalog') &&
          chdDom.isPointInFill(svgPoint)
        ) {
          chdDom.classList.add('active');
          const oldActivePolygons = viewer.querySelectorAll('polygon.active');
          if (oldActivePolygons) {
            oldActivePolygons.forEach((item) => {
              if (item !== chdDom) {
                item.classList.remove('active');
              }
            });
          }
          const target = document.querySelector(`.${resultClass}`);
          if (target) {
            const detail = {
              pageNumber: page.dataset.pageNumber,
              contentId: chdDom.dataset.contentId,
            };
            target.dispatchEvent(new CustomEvent('rect-click', { detail }));
            const relatedDom = target.querySelector<HTMLParagraphElement>(
              `[data-content-id="${detail.contentId}"]`,
            );
            const oldActiveDoms = target.querySelectorAll(`[data-content-id].active`);
            if (oldActiveDoms) {
              oldActiveDoms.forEach((item) => {
                if (item !== relatedDom) {
                  item.classList.remove('active');
                }
              });
            }
            if (relatedDom) {
              relatedDom.classList.add('active');

              // 滚动到视口
              relatedDom.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
          }
          break;
        }
      }

      break;
    }
  }
};

export function initObserve({
  target,
  rects,
  viewerRef,
  dpi = 144,
}: {
  target: any;
  rects?: { position: number[]; type: string; content_id: number; angle?: number }[][];
  viewerRef?: any;
  dpi?: number;
}) {
  if (!target || !rects || !viewerRef || !MutationObserver) return;
  const dpiScale = 96 / dpi;
  // 绘制框
  const createPage = (pageItem: HTMLDivElement) => {
    const page = pageItem.dataset.pageNumber;
    const { clientWidth, clientHeight } = pageItem;
    const curPageRects = rects[Number(page) - 1];
    if (page && Array.isArray(curPageRects) && curPageRects.length) {
      const oldDom = pageItem.querySelector(`.${rectClass}`);
      if (oldDom) {
        oldDom.remove();
      }
      const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const scale = viewerRef.currentScale;
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
        if (rect.type) {
          polygon.setAttribute('class', rect.type);
        }
        svgDom.appendChild(polygon);
        if (!isOver) {
          isOver =
            rect.position[2] - viewBoxWidth > 5 ||
            rect.position[4] - viewBoxWidth > 5 ||
            rect.position[5] - viewBoxHeight > 5 ||
            rect.position[7] - viewBoxHeight > 5;
        }
      });
      if (!isOver) {
        pageItem.insertBefore(svgDom, pageItem.children[pageItem.children.length - 1]);
      }
      const tips = document.querySelector<HTMLElement>('.rotate-file-tips');
      if (tips) {
        tips.style.display = isOver ? 'block' : 'none';
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
    try {
      if (list.forEach) {
        list.forEach((pageItem) => {
          createPage(pageItem);
        });
      }
      removeHidden();
    } catch (error) {
      console.log('MutationObserver callback error', error);
    }
  };

  // 监听属性data-loaded变化，重新绘制框
  const observer = new MutationObserver((records) => {
    const list = records.map ? records.map((item) => item.target) : [];
    handle(list);
  });
  observer.observe(target, { subtree: true, attributeFilter: ['data-loaded'] });
  // 清楚历史数据
  const oldPages: HTMLDivElement[] = target.querySelectorAll(`.${rectClass}`);
  oldPages.forEach((item) => {
    item.remove();
  });
  const initDoms = target.querySelectorAll('.page[data-loaded="true"]');
  handle(initDoms);

  // 框点击事件
  const viewer = document.querySelector('#viewer');
  viewer?.addEventListener('click', (e) => {
    try {
      clickHandle(e, { viewerRef, dpiScale });
    } catch (error) {
      console.log('框点击事件error', error);
    }
  });

  // 滚动同步
  viewerRef.eventBus.on('pagechanging', (params: { pageNumber: number; previous: number }) => {
    const resultPage = document.querySelector(
      `.${resultClass} [data-page-number="${viewerRef.currentPageNumber}"]`,
    );
    const activeContent = document.querySelector(`.${resultClass} .active[data-content-id]`);
    if (resultPage) {
      const scrollOptions: ScrollIntoViewOptions = { block: 'start', inline: 'nearest' };
      if (resultPage.contains(activeContent)) {
        scrollOptions.block = 'nearest';
      }
      if (params.pageNumber < params.previous) {
        scrollOptions.block = 'end';
      }
      resultPage.scrollIntoView(scrollOptions);
    }
  });
}
