import { useEffect, useMemo, useRef, useState } from 'react';
import { getRotateInfo } from './utils';

interface IUseScaleRotate {
  wrapperSize?: { width: number; height: number };
  rotate: number;
  scale: number;
  fixedRotate?: number; // 图片转正需要的角度
  imgDefaultSize?: { width: number; height: number };
  fullType?: 'cover' | 'width';
}

export interface ISize {
  width: number; // 以原图为基准
  height: number;
  wrapper: { width: number; height: number };
  fixedSize: {
    // 以转正后的图为基准
    width: number;
    height: number;
    natureSize: { width: number; height: number };
    translate: { x: number; y: number };
    rotate: number;
  };
  translate: { x: number; y: number };
  rotate: number;
  canvasSize: { width: number; height: number };
  scale: number;
}

/**
 * 缩放旋转图片
 */
function useScaleRotate(props: IUseScaleRotate) {
  const { wrapperSize, rotate, scale, fixedRotate = 0, imgDefaultSize, fullType } = props;

  const [defaultSize, setDefaultSize] = useState<ISize>();
  const [refresh, setRefresh] = useState<any>();
  const natureSize = useRef<{ width: number; height: number }>();
  const calcSize = useRef<(scale: number) => ISize>();

  useEffect(() => {
    if (imgDefaultSize) {
      natureSize.current = imgDefaultSize;
      setRefresh(Date.now());
    }
  }, []);

  useEffect(() => {
    if (natureSize.current && wrapperSize) {
      const { width: natureW, height: natureH } = natureSize.current;
      const imgRotate = fixedRotate + rotate;
      const { translate, canvasSize } = getRotateInfo(imgRotate, natureSize.current);
      const {
        scale: fullScale,
        width: fullW,
        height: fullH,
      } = getFullSize(canvasSize, wrapperSize);
      const { canvasSize: fixedSize } = getRotateInfo(fixedRotate, natureSize.current); // 原图转正后的width/height
      const { transform } = getRotateInfo(rotate, fixedSize);
      calcSize.current = (scale) => {
        const newScale = fullScale * scale;
        return {
          width: natureW * newScale,
          height: natureH * newScale,
          wrapper: { width: fullW * scale, height: fullH * scale },
          fixedSize: {
            width: fixedSize.width * newScale,
            height: fixedSize.height * newScale,
            natureSize: { width: fixedSize.width, height: fixedSize.height },
            translate: { x: transform.x * newScale, y: transform.y * newScale },
            rotate,
          },
          translate: { x: translate.x * newScale, y: translate.y * newScale },
          rotate: imgRotate,
          canvasSize: { width: canvasSize.width * newScale, height: canvasSize.height * newScale },
          scale: newScale,
        };
      };
      setDefaultSize(calcSize.current(1));
    }
  }, [rotate, fixedRotate, wrapperSize, refresh]);

  const size = useMemo(() => {
    if (calcSize.current) {
      return calcSize.current(scale);
    }
  }, [scale, defaultSize]);

  function onLoad(e: any) {
    const { naturalWidth, naturalHeight } = e.target;
    natureSize.current = { width: naturalWidth, height: naturalHeight };
    setRefresh(Date.now());
  }

  function getFullSize(
    nature: { width: number; height: number },
    wrapper: { width: number; height: number },
  ) {
    const { width, height } = nature;
    const scaleX = wrapper.width / width;
    const scaleY = wrapper.height / height;
    let scale = scaleX < scaleY ? scaleX : scaleY;
    if (fullType === 'width') {
      scale = scaleX;
    }
    return { width: width * scale, height: height * scale, scale };
  }

  return { size, natureSize, onLoad, getFullSize };
}

export default useScaleRotate;
