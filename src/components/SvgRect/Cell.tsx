import { memo, useLayoutEffect, useState } from 'react';
import { useUpdateEffect } from 'ahooks';
import classNames from 'classnames';
import icon1 from '@/assets/icon/eye-close.png';
import icon2 from '@/assets/icon/icon_eye_on.png';
import { removeCellActive } from '@/pages/DashboardCommon/components/RobotMainView/PDFViewer/utils';

export interface IViewBox {
  width: number;
  height: number;
  viewRate: number;
}

interface IProps {
  cells: { cells: { row: number; col: number; position: number[]; [key: string]: any }[] };
  points: number[];
  rate: number;
  type: string;
  uid: any;
  activeId?: any;
  onClick: (cellId: string) => void;
  viewBox?: IViewBox;
}

export const calcBtnPosition = ({ viewRate, points }: { viewRate: number; points: number[] }) => {
  // const gap = 4 * viewRate;
  const size = 18 * viewRate;
  const position = { x: points[2] - size, y: points[3] - size, size };
  const boundSize = 30 * viewRate;
  if (position.y < boundSize) {
    Object.assign(position, { x: points[2] - size, y: points[3] });
  }
  return position;
};

export default memo<IProps>(({ cells, type, rate, points, uid, onClick, activeId, viewBox }) => {
  const [btnPosition, setBtnPosition] = useState<{ x: number; y: number; size: number }>();

  useLayoutEffect(() => {
    if (viewBox) {
      const position = calcBtnPosition({ viewRate: viewBox.viewRate, points });
      setBtnPosition(position);
    }
  }, [viewBox]);

  useUpdateEffect(() => {
    if (activeId !== uid) {
      const oldCells = document.querySelectorAll(`.cell-g-wrapper path.active`);
      oldCells.forEach((cell) => {
        cell.classList.remove('active');
      });
    }
  }, [activeId]);

  const toggleShow = (e: any) => {
    const wrapper = e.target.parentElement as SVGGElement;
    if (wrapper) {
      wrapper.classList.toggle('cell-g-hidden');
      if (wrapper.classList.contains('cell-g-hidden')) {
        removeCellActive(wrapper);
      }
    }
  };

  const onCellClick = (e: any, cellId: string) => {
    const oldCells = document.querySelectorAll(`.cell-g-wrapper path.active`);
    oldCells.forEach((cell) => {
      cell.classList.remove('active');
    });
    e.target.classList.add('active');
    onClick(cellId);
  };

  return (
    <>
      {cells
        ? Array.isArray(cells.cells) && (
            <g className="cell-g-wrapper" data-content-id={uid}>
              <polygon
                data-content-id={uid}
                vectorEffect="non-scaling-stroke"
                points={`${points[0]} ${points[1]},${points[2]} ${points[3]},${points[4]} ${points[5]},${points[6]} ${points[7]}`}
                className={classNames({
                  active: activeId === uid,
                  [type]: type,
                })}
                onClick={() => onClick(uid)}
              />
              {cells.cells.map((cell: any) => {
                const list = cell.position.map((val: number) => Math.round(val * rate));
                const cellId = `${uid}_cell_${cell.cell_id}`;
                return (
                  <path
                    key={cell.position.join()}
                    data-content-id={cellId}
                    d={`M ${list[0]} ${list[1]} L ${list[2]} ${list[3]} L ${list[4]} ${list[5]} L ${list[6]} ${list[7]} Z`}
                    className={type}
                    onClick={(e) => onCellClick(e, cellId)}
                  />
                );
              })}
              {btnPosition && (
                <>
                  <image
                    className="cell-toggle cell-toggle-hidden"
                    onClick={toggleShow}
                    href={icon1}
                    x={btnPosition.x}
                    y={btnPosition.y}
                    width={btnPosition.size}
                    height={btnPosition.size}
                  />
                  <image
                    className="cell-toggle cell-toggle-show"
                    onClick={toggleShow}
                    href={icon2}
                    x={btnPosition.x}
                    y={btnPosition.y}
                    width={btnPosition.size}
                    height={btnPosition.size}
                  />
                </>
              )}
            </g>
          )
        : null}
    </>
  );
});
