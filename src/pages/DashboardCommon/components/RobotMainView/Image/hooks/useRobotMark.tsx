import type React from 'react';
import { useRef, useState } from 'react';
import { useSize, useDebounceFn, useUpdateEffect, useEventListener } from 'ahooks';

interface IPositionStyle {
  width: number;
  height: number;
  left: number;
  top: number;
}
interface ToolOptions {
  angle?: number;
  angleFix?: boolean;
  onSizeChange?: () => void;
  clearList?: () => void;
  resizeScale: () => void;
}
export default function useMarkTool(
  imgRef: React.MutableRefObject<HTMLImageElement | null>,
  { angle, angleFix, onSizeChange = () => {}, resizeScale, clearList = () => {} }: ToolOptions,
) {
  const imgWrapSize = useSize(document.querySelector('#imgContainer') as HTMLLIElement);
  const isClear = useRef(false);
  const [markStyle, setMarkStyle] = useState<IPositionStyle>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const winSizeFn = useDebounceFn(
    () => {
      isClear.current = false;
      updateMark();
      onSizeChange();
    },
    { wait: 0 },
  );

  // 监听容器尺寸变化,如果改变则清除画框，重置旋转角度
  useUpdateEffect(() => {
    winSizeFn.run();
    if (!isClear.current) {
      resizeScale();
      isClear.current = true;
      clearList();
    }
  }, [imgWrapSize]);

  // 有旋转角度时,监听旋转结束后更新蒙层位置
  useEventListener(
    'transitionend',
    () => {
      if (angle === 90 || angle === 270) {
        updateMark();
        if (onSizeChange) {
          onSizeChange();
        }
      }
    },
    { target: imgRef },
  );

  function updateMark() {
    if (!imgRef.current) return;
    const { width = 0, height = 0, offsetLeft: left, offsetTop: top } = imgRef.current;
    let currentStyle = {
      left,
      top,
      width,
      height,
    };
    // 旋转角度 width <=> height 补位
    if (angleFix && angle) {
      const diff = (width - height) / 2;
      currentStyle = {
        width: height,
        height: width,
        left: left + diff,
        top: top - diff,
      };
    }
    setMarkStyle(currentStyle);
  }

  return { markStyle, updateMark };
}
