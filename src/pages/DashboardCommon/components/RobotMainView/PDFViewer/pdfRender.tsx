import type { ReactNode } from 'react';
import { useEffect, useRef, useState, useMemo, useLayoutEffect } from 'react';
import { Pagination } from 'antd';
import { useScroll, useSize } from 'ahooks';
import { ReactComponent as OutlineRight } from '@/assets/icon/dashbord/outline-right.svg';
import { ReactComponent as OutlineLeft } from '@/assets/icon/dashbord/outline-left.svg';
import styles from './index.less';
import { addDataToURL } from '@/utils';
import ImageWithMask from './components/ImageWithMask';
import { getVisibleChildIndex, scrollToChild } from '@/utils/dom';
import {
  getCellId,
  getPageNumberFromActiveContent,
  resultClass,
  scrollToResultTarget,
} from './utils';

interface IProps {
  scale: number;
  angle: number;
  currentFile?: any;
  getImgRef?: (ref: any) => any;
  onLoad?: (e: any) => void;
  onError?: (e: any) => void;
}

// 直接传入PDF的每页解析结果，直接展示。不使用pdfdist解析。
function PDFRenderViewer(props: IProps) {
  const { currentFile, getImgRef, onLoad, onError, angle, scale } = props;
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 0 });
  const containerRef = useRef();
  const { top } = useScroll(containerRef);

  const latestFile = useRef(currentFile);
  latestFile.current = currentFile;

  useEffect(() => {
    if (currentFile.parserPages?.length) {
      onLoad?.({});
      setPageInfo({ current: 1, total: currentFile.parserPages?.length || 0 });
    } else {
      onError?.({});
    }
  }, [currentFile.parserPages]);

  useEffect(() => {
    setPageByTop();
  }, [top, scale]);

  const pageList = useMemo(() => {
    if (!currentFile.result || !currentFile.parserPages?.length || currentFile.hiddenRects)
      return [];
    const { parserPages: pages, rects }: { parserPages: any[]; rects: any[] } = currentFile;

    const list = pages.map((page: any, pageIndex: any) => {
      const index = typeof page.index === 'number' ? page.index - 1 : pageIndex;
      const pageData = {
        ...page,
        rectList: (rects?.[index] || []).map((item: any) => {
          const row = {
            ...item,
            uid: item.uid || item.content_id,
            points: item.points || item.position,
          };
          return row;
        }),
        url: page.image && addDataToURL(page.image.base64, 'png'),
        width: page.width,
        angle: page.original_angle,
      };
      return pageData;
    });
    return list;
  }, [currentFile]);

  useLayoutEffect(() => {
    if (currentFile.scrollIntoView) {
      const page = getPageNumberFromActiveContent();
      if (typeof page === 'number') {
        setTimeout(() => {
          onPageChange(page);
        }, 64);
      }
    }
  }, [pageList]);

  function setPageByTop() {
    const firstDomIndex = getVisibleChildIndex(containerRef.current);
    if (firstDomIndex < 0) {
      return;
    }
    const pageIndex = firstDomIndex + 1;
    if (pageIndex !== pageInfo.current) {
      scrollContentPage(pageIndex);
      setPageInfo((pre) => ({ ...pre, current: pageIndex }));
    }
  }

  function scrollContentPage(pageNumber: number) {
    const viewActiveContent = document.querySelectorAll<HTMLElement>(
      `#imgContainer [data-page-number="${pageNumber}"] .active[data-content-id]`,
    );
    if (viewActiveContent.length) {
      const lastDom = viewActiveContent[viewActiveContent.length - 1];
      const contentId = lastDom.dataset.contentId || '';
      const isTableCell = lastDom.tagName.toLowerCase() === 'path';
      const detail = isTableCell
        ? {
            pageNumber,
            contentId: contentId.split('_cell_')[0],
            cell: getCellId(contentId),
            onlyScroll: true,
          }
        : { pageNumber, contentId, onlyScroll: true };
      scrollToResultTarget(detail);
      return;
    }

    const resultPage = document.querySelector(`.${resultClass} [data-page-number="${pageNumber}"]`);
    if (resultPage) {
      const scrollOptions: ScrollIntoViewOptions = { block: 'start', inline: 'nearest' };
      if (pageNumber < pageInfo.current) {
        scrollOptions.block = 'end';
      }
      resultPage.scrollIntoView(scrollOptions);
    }
  }

  function onContainerRef(ref: any) {
    getImgRef?.(ref);
    containerRef.current = ref;
  }

  function onPageChange(current: number) {
    scrollContentPage(current);
    setPageInfo((pre) => ({ ...pre, current }));
    scrollToChild(containerRef.current, current - 1);
  }

  const pageItemRender = (current: number, type: string, originalElement: ReactNode) => {
    if (type === 'prev') {
      return <OutlineLeft className={'page_change_icon'} />;
    }
    if (type === 'next') {
      return <OutlineRight className={'page_change_icon'} />;
    }
    return originalElement;
  };

  const containerSize = useSize(containerRef);

  const wrapperSize = useMemo(() => {
    return {
      width: typeof containerSize?.width === 'number' ? containerSize?.width : 0,
      height: typeof containerSize?.height === 'number' ? containerSize?.height : 0,
    };
  }, [containerSize]);

  const onPageLoad = (pageNumber: number) => {
    if (!currentFile.scrollIntoView) return;
    requestAnimationFrame(() => {
      const activeContent = document.querySelector<HTMLElement>(
        `.${resultClass} [data-page-number="${pageNumber}"] .active[data-content-id]`,
      );
      const contentId = activeContent?.dataset.contentId;
      if (contentId) {
        const activeCell = activeContent.querySelector<HTMLElement>(`table .active`);
        const activeRects = document.querySelectorAll<HTMLElement>(
          `#imgContainer [data-page-number="${pageNumber}"] [data-content-id="${contentId}"]`,
        );
        if (activeRects.length) {
          activeRects.forEach((rect) => {
            rect.classList.add('active');
          });
          activeRects[0].scrollIntoView({ block: 'center', inline: 'nearest' });
          if (activeCell) {
            activeCell.click();
          }
        } else {
          setTimeout(() => {
            const activeRects = document.querySelectorAll<HTMLElement>(
              `#imgContainer [data-page-number="${pageNumber}"] [data-content-id="${contentId}"]`,
            );
            if (activeRects.length) {
              activeRects.forEach((rect) => {
                rect.classList.add('active');
              });
              activeRects[0].scrollIntoView({ block: 'center', inline: 'nearest' });
              if (activeCell) {
                activeCell.click();
              }
            }
          }, 100);
        }
      }
    });
  };

  return (
    <>
      <div ref={onContainerRef} className={styles['pdf-viewer']}>
        {pageList.map((page, index) => {
          return (
            <ImageWithMask
              key={page.index}
              page={page}
              wrapperSize={wrapperSize as any}
              angle={angle}
              fixedRotate={page.fixedRotate}
              scale={scale}
              pageNumber={index + 1}
              pageInfo={pageInfo}
              onLoad={onPageLoad}
            />
          );
        })}
      </div>

      {!!pageInfo.total && (
        <Pagination
          simple
          {...pageInfo}
          pageSize={1}
          itemRender={pageItemRender}
          onChange={onPageChange}
          className={styles['pdf-page']}
        />
      )}
    </>
  );
}

export default PDFRenderViewer;
