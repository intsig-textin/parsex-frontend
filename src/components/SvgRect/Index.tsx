import classNames from 'classnames';
import type { ReactNode, SVGProps } from 'react';
import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { useSize } from 'ahooks';
import RectText from './Text';
import { IRectListItem } from './data.d';
import styles from './Index.less';

export { IRectListItem };

export function getImgWidth(result: any, img: any) {
  if (result?.width) {
    return result?.width;
  } else if (result?.rotated_image_width) {
    return !(result?.image_angle % 90) && result?.image_angle % 180
      ? result?.rotated_image_height
      : result?.rotated_image_width;
  }
  if (!img) return 1;
  const { width, height, naturalWidth, naturalHeight } = img;
  // 图片是否旋转
  if (Math.abs(width / height - naturalWidth / naturalHeight) <= 0.01) {
    // 宽高比例一致，未旋转
    return img?.naturalWidth;
  }
  return img?.naturalHeight;
}

interface IProps {
  svgAttr?: SVGProps<any>;
  rate: number;
  rectList: IRectListItem[];
  onClick?: (id: React.ReactText) => void;
  focusId?: React.ReactText;
  showText?: boolean;
  autoLink?: boolean;
}

/**
 *
 * @description v3.1 接口画框
 */

export default ({
  svgAttr,
  rate,
  rectList,
  showText,
  focusId,
  onClick = () => {},
  autoLink,
}: IProps) => {
  const [activeId, setActiveId] = useState<string | number>(-1);
  const [isOverRange, setIsOverRange] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const wrapperSize = useSize(document.querySelector('.textin-image-robot-mark') as HTMLElement);

  useEffect(() => {
    if (focusId) {
      setActiveId(focusId);
    }
  }, [focusId]);

  useEffect(() => {
    // 隐藏超出范围的框
    try {
      if (svgRef.current && svgRef.current.parentElement && Array.isArray(rectList) && rate) {
        let { clientWidth, clientHeight } = svgRef.current.parentElement;
        const viewBox = svgRef.current.getAttribute('viewBox') || '';
        if (viewBox) {
          const [_, __, width, height] = viewBox.split(' ').map((i) => Number(i));
          clientWidth = width;
          clientHeight = height;
        }
        const isOver = rectList.some(
          ({ points }) =>
            points[2] * rate - clientWidth > 5 ||
            points[4] * rate - clientWidth > 5 ||
            points[5] * rate - clientHeight > 5 ||
            points[7] * rate - clientHeight > 5,
        );
        setIsOverRange(isOver);
      }
    } catch (error) {
      console.log('判断isOver', error);
    }
  }, [rectList, rate, wrapperSize]);

  const autoLinkHandle = (id: string, e: any) => {
    if (!svgRef.current) return;
    const polygonDom = e.target;
    polygonDom.classList.add('active');
    const oldActivePolygons = svgRef.current.querySelectorAll('polygon.active');
    if (oldActivePolygons) {
      oldActivePolygons.forEach((item) => {
        if (item !== polygonDom) {
          item.classList.remove('active');
        }
      });
    }
    const detail = {
      pageNumber: 1,
      contentId: id,
    };
    const target = document.querySelector(`.result-content-body`);
    if (!target) return;
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
  };

  const handleClick = useCallback(
    (id: string, e: any) => {
      if (autoLink) {
        autoLinkHandle(id, e);
      } else {
        setActiveId(id);
        onClick(id);
      }
    },
    [autoLink],
  );

  return (
    <svg
      data-page-number="1"
      className={classNames(styles.svg, { [styles['over-range']]: isOverRange })}
      ref={svgRef}
      {...svgAttr}
    >
      {rectList.map((item, idx) => (
        <Rect
          {...item}
          rate={rate}
          activeId={activeId}
          onClick={handleClick}
          key={item.uid || item.key}
          renderText={(points) => showText && <RectText points={points} num={idx + 1} />}
        />
      ))}
    </svg>
  );
};

interface IRectProps extends IRectListItem {
  rate: number;
  activeId: any;
  onClick: (id: any, e: any) => void;
  renderText: (point: number[]) => ReactNode;
}

const Rect = memo(
  ({ points, rate, activeId, uid, onClick, renderText, type = 'paragraph' }: IRectProps) => {
    if (!rate) return null;

    const list = points.map((val) => Math.round(val * rate));
    const finalPoints = `${list[0]} ${list[1]},${list[2]} ${list[3]},${list[4]} ${list[5]},${list[6]} ${list[7]}`;
    const cls = classNames({
      active: activeId === uid,
      [type]: type,
    });

    return (
      <>
        <polygon
          data-content-id={uid}
          vectorEffect="non-scaling-stroke"
          points={finalPoints}
          className={cls}
          onClick={(e) => onClick(uid, e)}
        />
        {renderText(list)}
      </>
    );
  },
);
