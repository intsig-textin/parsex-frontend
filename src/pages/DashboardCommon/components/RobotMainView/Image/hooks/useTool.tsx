import React, { useEffect, useRef, useState } from 'react';
import { MinusOutlined } from '@ant-design/icons';
import { useThrottleEffect } from 'ahooks';
import { ReactComponent as RotateLeft } from '../icon/icon_img_rotate-90_default.svg';
import { ReactComponent as RotateRight } from '../icon/icon_img_rotate+90_default.svg';
import { ReactComponent as ZoomIn } from '../icon/icon_img_enlarge_default.svg';
import { ReactComponent as ZoomOut } from '../icon/icon_img_narrow_default.svg';
import { ReactComponent as Normal } from '../icon/icon_img_normal_default.svg';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import useFrameSetState from './useFrameSetState';
import getFixScaleEleTransPosition from '../getFixScaleEleTransPosition';

const initialPosition = {
  x: 0,
  y: 0,
};

const MAX_SCALE_VALUE = 4;
const ZOOM_STEP = 0.25;
export default function useTool() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgContainerRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [position, setPosition] = useFrameSetState<{
    x: number;
    y: number;
  }>(initialPosition);

  const originPositionRef = React.useRef<{
    originX: number;
    originY: number;
    deltaX: number;
    deltaY: number;
  }>({
    originX: 0,
    originY: 0,
    deltaX: 0,
    deltaY: 0,
  });
  const [isMoving, setMoving] = React.useState(false);

  // img tools
  const onZoomIn = () => {
    if (scale < MAX_SCALE_VALUE) {
      setScale((value) => value + ZOOM_STEP);
    }
    setPosition(initialPosition);
  };

  const onZoomOut = () => {
    if (scale > 1) {
      setScale((value) => value - ZOOM_STEP);
    }
    setPosition(initialPosition);
  };

  const onRotateNormal = () => {
    clear();
  };
  const onRotateRight = () => {
    setRotate((value) => value + 90);
  };

  const onRotateLeft = () => {
    setRotate((value) => value - 90);
  };
  const clear = () => {
    setPosition(initialPosition);
    resizeScale();
    setMoving(false);
    setRotate(0);
  };
  const resizeScale = () => setScale(1);

  const tools = [
    {
      Icon: RotateRight,
      onClick: onRotateRight,
      type: 'rotateRight',
    },
    {
      Icon: RotateLeft,
      onClick: onRotateLeft,
      type: 'rotateLeft',
    },
    {
      Icon: MinusOutlined,
      disabled: true,
      type: 'line',
      rotate: 90,
      width: 1,
    },
    {
      Icon: Normal,
      onClick: onRotateNormal,
      type: 'normal',
      disabled: scale === 1,
    },
    {
      Icon: ZoomIn,
      onClick: onZoomIn,
      type: 'zoomIn',
      disabled: scale === MAX_SCALE_VALUE,
    },
    {
      Icon: ZoomOut,
      onClick: onZoomOut,
      type: 'zoomOut',
      disabled: scale === 1,
    },
  ];

  // 处理旋转后、宽高补位
  useEffect(() => {
    if (rotate) {
      fixPosition();
    }
  }, [rotate]);

  function fixPosition() {
    if (!imgRef.current) return;
    const width = imgRef.current.offsetWidth * scale;
    const height = imgRef.current.offsetHeight * scale;
    const { left: imgLeft, top: imgTop } = imgRef.current.getBoundingClientRect();
    const { left: wrapLeft, top: wrapTop } = imgContainerRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    };

    const isRotate = rotate % 180 !== 0;
    const fixState = getFixScaleEleTransPosition(
      isRotate ? height : width,
      isRotate ? width : height,
      imgLeft - wrapLeft,
      imgTop - wrapTop,
    ) || { x: 0, y: 0 };
    if (fixState) {
      setPosition({ ...fixState });
    }
  }
  const onMouseUp: React.MouseEventHandler<HTMLBodyElement> = () => {
    if (isMoving) {
      setMoving(false);
      fixPosition();
    }
  };
  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    // Without this mask close will abnormal
    event.stopPropagation();
    originPositionRef.current.deltaX = event.pageX - position.x;
    originPositionRef.current.deltaY = event.pageY - position.y;
    originPositionRef.current.originX = position.x;
    originPositionRef.current.originY = position.y;
    setMoving(true);
  };
  const onMouseMove: React.MouseEventHandler<HTMLBodyElement> = (event) => {
    if (isMoving) {
      setPosition({
        x: event.pageX - originPositionRef.current.deltaX,
        y: event.pageY - originPositionRef.current.deltaY,
      });
    }
  };

  /**
   * 处理滚动事件
   */
  const [wheelNum, setWheelNum] = useState<number>(0);
  useThrottleEffect(
    () => {
      if (!wheelNum) return;
      if (wheelNum > 1) {
        onZoomIn();
        setWheelNum(0);
        return;
      }
      if (wheelNum < -1) {
        onZoomOut();
        setWheelNum(0);
      }
    },
    [wheelNum],
    {
      wait: 40,
    },
  );
  const onWheel = (event: WheelEvent) => {
    // event.preventDefault();
    // deltaY < 100 区分笔记本触摸板滑动
    if (event.ctrlKey || Math.abs(event.deltaY) < 100) return;
    const direct = event.deltaY > 0 ? 'down' : 'up';
    setWheelNum((num) => {
      let curNum = num;
      if (direct === 'up') {
        curNum += 1;
      } else {
        curNum -= 1;
      }
      return curNum;
    });
  };

  useEffect(() => {
    let onTopMouseUpListener: any;
    let onTopMouseMoveListener: any;

    const onMouseUpListener = addEventListener(window, 'mouseup', onMouseUp, false);
    const onMouseMoveListener = addEventListener(window, 'mousemove', onMouseMove, false);

    return () => {
      onMouseUpListener.remove();
      onMouseMoveListener.remove();

      /* istanbul ignore next */
      if (onTopMouseUpListener) onTopMouseUpListener.remove();
      /* istanbul ignore next */
      if (onTopMouseMoveListener) onTopMouseMoveListener.remove();
    };
  }, [isMoving]);

  return {
    imgRef,
    imgContainerRef,
    tools,
    scale,
    rotate,
    position,
    onMouseDown,
    onWheel,
    resizeScale,
  };
}
