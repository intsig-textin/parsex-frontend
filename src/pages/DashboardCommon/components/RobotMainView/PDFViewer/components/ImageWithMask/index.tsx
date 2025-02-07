import type { FC, ReactText } from 'react';
import { Spin } from 'antd';
import Rect from '@/components/SvgRect/Index';
import type { IRectListItem } from '@/components/SvgRect/Index';
import useScaleRotate from '../hookes/useScaleRotate';
import useLoadImg from './useLoadImg';
import styles from './index.less';

interface ImageWithMaskProps {
  page: {
    [key: string]: any;
    url: string;
    width: number;
    height: number;
    rectList: IRectListItem[];
  };
  focusId?: ReactText;
  onClick?: (id: ReactText) => void;
  angle: number;
  fixedRotate?: number;
  scale: number;
  wrapperSize?: { width: number; height: number };
  pageNumber: number;
  pageInfo: { current: number; total: number };
  onLoad?: (page: number) => void;
}
const ImageWithMask: FC<ImageWithMaskProps> = ({
  page,
  angle,
  fixedRotate,
  scale,
  wrapperSize,
  pageNumber,
  pageInfo,
  ...rectProps
}) => {
  const { rectList } = page;

  const { src, status } = useLoadImg({ page, pageNumber, pageInfo });

  const { size, onLoad } = useScaleRotate({
    wrapperSize,
    rotate: angle,
    fixedRotate,
    scale,
    imgDefaultSize: { width: page.width, height: page.height },
    fullType: 'width',
  });
  const fixedSize = size?.fixedSize;

  return (
    <div
      className={styles.mask}
      style={{ width: size?.wrapper.width, height: size?.wrapper.height }}
    >
      {!!rectList && rectList.length > 0 && !!fixedSize && (
        <div
          className={styles.rect}
          style={{
            transform: `rotate(${fixedSize?.rotate}deg) translate3d(${fixedSize?.translate.x}px, ${fixedSize?.translate.y}px, 0)`,
            width: fixedSize?.width,
            height: fixedSize?.height,
          }}
        >
          <Rect
            svgAttr={{
              viewBox: `0 0 ${fixedSize?.natureSize?.width} ${fixedSize?.natureSize?.height}`,
            }}
            rectList={src ? rectList : []}
            rate={1}
            pageNumber={pageNumber}
            {...rectProps}
            autoLink
          />
        </div>
      )}
      <img
        style={{
          opacity: size ? 1 : 0,
          transform: size && `rotate(${size.rotate}deg)`,
          left: size?.translate.x,
          top: size?.translate.y,
        }}
        width={size?.width}
        height={size?.height}
        src={src}
        onLoad={(e) => {
          onLoad(e);
          rectProps.onLoad?.(pageNumber);
        }}
        alt=""
      />

      {!src && (
        <div className={styles.loading}>
          <Spin tip={{ expired: '图片已过期', error: '加载失败' }[status]} />
        </div>
      )}
    </div>
  );
};
export default ImageWithMask;
