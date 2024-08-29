import { useEffect } from 'react';

const useContentClick = ({ onRectClick }: { onRectClick?: (e: any) => void } = {}) => {
  useEffect(() => {
    const dom = document.querySelector('.result-content-body');
    if (dom) {
      dom.addEventListener('click', (e) => {
        const wrapper = e.currentTarget as HTMLDivElement;
        let target: any = e.target;
        let activeTarget: HTMLDivElement | undefined;
        while (target && wrapper.contains(target)) {
          if (target.dataset.contentId) {
            activeTarget = target;
            break;
          } else {
            target = target.parentElement;
          }
        }
        const oldActiveDoms = dom.querySelectorAll<HTMLDivElement>(`[data-content-id].active`);
        if (oldActiveDoms) {
          oldActiveDoms.forEach((item) => {
            if (item !== activeTarget) {
              item.classList.remove('active');
            }
          });
        }
        if (activeTarget) {
          activeTarget.classList.add('active');

          const pageNumber = activeTarget.parentElement?.dataset.pageNumber;
          const activePage = document.querySelector(
            `#imgContainer [data-page-number="${pageNumber}"]`,
          );
          const oldActivePolygons = document.querySelectorAll('#imgContainer polygon.active');
          if (oldActivePolygons) {
            oldActivePolygons.forEach((item) => {
              item.classList.remove('active');
            });
          }
          activePage?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          const handle = () => {
            const targetPolygon = activePage?.querySelector(
              `polygon[data-content-id="${activeTarget.dataset.contentId}"]`,
            );
            if (targetPolygon) {
              targetPolygon.classList.add('active');
              targetPolygon.scrollIntoView({ block: 'nearest', inline: 'nearest' });
              return true;
            }
            return false;
          };
          requestAnimationFrame(() => {
            if (!handle()) {
              requestAnimationFrame(() => {
                handle();
              });
            }
          });
        }
      });
      dom.addEventListener('rect-click', (e: any) => {
        onRectClick?.(e);
      });
    }
  }, []);
};

export default useContentClick;
