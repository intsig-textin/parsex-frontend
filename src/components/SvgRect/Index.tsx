import classNames from 'classnames';
import type { ReactNode, SVGProps } from 'react';
import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { useSize } from 'ahooks';
import RectText from './Text';
import type { IViewBox } from './Cell';
import Cell from './Cell';
import { IRectListItem } from './data.d';
import styles from './Index.less';
import {
  getCellId,
  scrollToResultTarget,
} from '@/pages/DashboardCommon/components/RobotMainView/PDFViewer/utils';

export { IRectListItem };

export function getImgWidth(result: any, img: any) {
  if (result?.width) {
    return result?.width;
  } else if (result?.rotated_image_width) {
    if (!img) return result.rotated_image_width;
    // 卡证类，不同服务的之间image_angle/rotated_image_width/rotated_image_height的逻辑不统一，只能通过尽量兼容
    const { rotated_image_width: width, rotated_image_height: height } = result;
    const { naturalWidth, naturalHeight } = img;
    // 图片是否旋转
    if (Math.abs(width / height - naturalWidth / naturalHeight) <= 0.02) {
      // 宽高比例一致，未旋转
      return width;
    }
    return height;
  }
  if (!img) return 1;
  const { width, height, naturalWidth, naturalHeight } = img;
  // 图片是否旋转
  if (Math.abs(width / height - naturalWidth / naturalHeight) <= 0.02) {
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
  className?: string;
  pageNumber?: number | string;
  hiddenOverRange?: boolean;
}

/**
 *
 * @description v3.1 接口画框
 */

export default ({
  className,
  svgAttr,
  rate,
  rectList,
  showText,
  focusId,
  onClick = () => {},
  autoLink,
  pageNumber = '1',
  hiddenOverRange = true,
}: IProps) => {
  const [activeId, setActiveId] = useState<string | number>(-1);
  const [isOverRange, setIsOverRange] = useState(false);
  const [viewBox, setViewBox] = useState<IViewBox>();
  const svgRef = useRef<SVGSVGElement>(null);

  const wrapperSize = useSize(document.querySelector('.textin-image-robot-mark') as HTMLElement);

  useEffect(() => {
    if (focusId) {
      setActiveId(focusId);
    } else {
      setActiveId('');
    }
  }, [focusId]);

  useEffect(() => {
    // 隐藏超出范围的框
    try {
      if (svgRef.current && svgRef.current.parentElement && Array.isArray(rectList) && rate) {
        let { clientWidth, clientHeight } = svgRef.current.parentElement;
        const viewBox = svgRef.current.getAttribute('viewBox') || '';
        let viewRate = 1;
        if (viewBox) {
          const [_, __, width, height] = viewBox.split(' ').map((i) => Number(i));
          viewRate = width / clientWidth;
          clientWidth = width;
          clientHeight = height;
        }
        setViewBox({ width: clientWidth, height: clientHeight, viewRate });
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
  }, [rectList, rate, wrapperSize, svgAttr]);

  const autoLinkHandle = (id: string, cellId: string) => {
    if (!svgRef.current) return;
    const oldActivePolygons = document.querySelectorAll('#imgContainer polygon.active');
    oldActivePolygons.forEach((item) => {
      item.classList.remove('active');
    });
    if (!cellId) {
      const oldCells = document.querySelectorAll(`.cell-g-wrapper path.active`);
      oldCells.forEach((cell) => {
        cell.classList.remove('active');
      });
    }
    const newActivePolygons = document.querySelectorAll(
      `#imgContainer polygon[data-content-id="${id}"]`,
    );
    newActivePolygons.forEach((item) => {
      item.classList.add('active');
    });
    const detail = {
      pageNumber: 1,
      contentId: id,
      cell: getCellId(cellId),
    };
    const target = scrollToResultTarget(detail);
    if (!target) return;
    target.dispatchEvent(new CustomEvent('rect-click', { detail }));
  };

  const handleClick = useCallback(
    (id: string, cell: any) => {
      if (autoLink) {
        autoLinkHandle(id, cell);
      } else {
        setActiveId(id);
        onClick(id);
      }
    },
    [autoLink],
  );

  return (
    <svg
      data-page-number={pageNumber}
      className={classNames(className, styles.svg, {
        [styles['over-range']]: isOverRange && hiddenOverRange,
      })}
      ref={svgRef}
      {...svgAttr}
    >
      {rectList.map((item, idx) => (
        <Rect
          {...item}
          rate={rate}
          activeId={activeId}
          onClick={handleClick}
          // eslint-disable-next-line react/no-array-index-key
          key={`rect-${idx}-${item.uid || item.key}`}
          renderText={(points) =>
            (showText || !!item.renderText) && (
              <RectText points={points} num={item.renderText || idx + 1} />
            )
          }
          viewBox={viewBox}
        />
      ))}
    </svg>
  );
};

interface IRectProps extends IRectListItem {
  rate: number;
  activeId: any;
  onClick: (id: any, cell?: string) => void;
  renderText: (point: number[]) => ReactNode;
  viewBox?: IViewBox;
}

const Rect = memo(
  ({
    points,
    rate,
    activeId,
    uid,
    onClick,
    renderText,
    type = 'paragraph',
    cells,
    viewBox,
  }: IRectProps) => {
    if (!rate || !(Array.isArray(points) && points.length)) return null;

    const list = points.map((val) => Math.round(val * rate));
    const finalPoints = `${list[0]} ${list[1]},${list[2]} ${list[3]},${list[4]} ${list[5]},${list[6]} ${list[7]}`;
    const cls = classNames({
      active: activeId === uid,
      [type]: type,
    });

    if (cells) {
      return (
        <Cell
          cells={cells}
          rate={rate}
          type={type}
          points={list}
          uid={uid}
          onClick={(cell) => onClick(uid, cell)}
          viewBox={viewBox}
        />
      );
    }

    return (
      <>
        <polygon
          data-content-id={uid}
          vectorEffect="non-scaling-stroke"
          points={finalPoints}
          className={cls}
          onClick={() => onClick(uid)}
        />
        {renderText(list)}
      </>
    );
  },
);
