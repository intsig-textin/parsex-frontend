import useLatest from '@/utils/hooks/useLatest';
import { useEffect } from 'react';

interface IProps {
  onRectClick?: (e: any) => void;
  scrollToCenter?: boolean;
  run?: boolean;
}

const useContentClick = ({ onRectClick, scrollToCenter, run = true }: IProps = {}) => {
  const latestRectClick = useLatest(onRectClick);

  useEffect(() => {
    const dom = document.querySelector('.result-content-body');
    if (dom && run) {
      dom.addEventListener('click', clickHandle);
      dom.addEventListener('rect-click', rectClickHandle);

      return () => {
        dom.removeEventListener('click', clickHandle);
        dom.removeEventListener('rect-click', rectClickHandle);
      };
    }
  }, [run]);

  function clickHandle(e: any) {
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
    const oldActiveDoms = wrapper.querySelectorAll<HTMLDivElement>(`[data-content-id].active`);
    if (oldActiveDoms) {
      oldActiveDoms.forEach((item) => {
        if (item !== activeTarget) {
          item.classList.remove('active');
        }
      });
    }
    if (activeTarget) {
      activeTarget.classList.add('active');

      let pageNumber = '';
      let pageTarget = activeTarget.parentElement;
      let loopNum = 1;
      while (pageTarget) {
        const page = pageTarget.dataset.pageNumber;
        if (page) {
          pageNumber = page;
          break;
        } else {
          pageTarget = pageTarget.parentElement;
        }
        loopNum += 1;
        if (loopNum > 10) {
          break;
        }
      }

      scrollToTarget({ pageNumber, contentId: activeTarget.dataset.contentId });
    }
  }

  function scrollToTarget(params: {
    pageNumber?: string | number;
    contentId?: string;
    scrollToCenter?: boolean;
  }) {
    const { pageNumber, contentId } = params;
    const scrollToCenterView = params.hasOwnProperty('scrollToCenter')
      ? params.scrollToCenter
      : scrollToCenter;
    const activePage = document.querySelector(`#imgContainer [data-page-number="${pageNumber}"]`);
    const oldActivePolygons = document.querySelectorAll('#imgContainer polygon.active');
    if (oldActivePolygons) {
      oldActivePolygons.forEach((item) => {
        item.classList.remove('active');
      });
    }
    if (scrollToCenterView) {
      activePage?.scrollIntoView();
    } else {
      activePage?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    const handle = () => {
      const targetPolygon = activePage?.querySelector(`polygon[data-content-id="${contentId}"]`);
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

  function rectClickHandle(e: any) {
    latestRectClick.current?.(e);
  }

  return { scrollToTarget };
};

export default useContentClick;
