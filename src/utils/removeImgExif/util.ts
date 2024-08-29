// import * as EXIF from 'exif-js';
import getOrientationFn from './getOrientation';
import { base64ToBlob } from '../fileUtil';

export function getImage(src: string | File): Promise<HTMLImageElement> {
  const img = new Image();
  img.setAttribute('crossOrigin', 'Anonymous');
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = typeof src === 'string' ? src : URL.createObjectURL(src);
  });
}

// export function getOrientation(img: any): Promise<number> {
//   return new Promise((resolve) => {
//     EXIF.getData(img, () => {
//       const orientation = EXIF.getTag(img, 'Orientation');
//       resolve(orientation || 0);
//     });
//   });
// }

export function getOrientation(img: string | Blob): Promise<number> {
  return new Promise(async (resolve) => {
    try {
      const imgBlob = await getImgBlob(img);
      const orientation = await getOrientationFn(imgBlob);
      resolve(orientation || 0);
    } catch (error) {
      resolve(0);
    }
  });
}

export async function getImgBlob(src: string | Blob): Promise<Blob> {
  if (typeof src === 'string') {
    if (/^blob\:/i.test(src)) {
      return await fetch(src).then((res) => res.blob());
    } else {
      return base64ToBlob(src);
    }
  }
  return src;
}

export function getSize(width: number, height: number, maxSize: number = Number.MAX_SAFE_INTEGER) {
  const parseWidth = maxSize < width ? maxSize : width;
  const parseHeight = maxSize < height ? maxSize : height;
  if (width > height) {
    return {
      width: parseWidth,
      height: height * (parseWidth / width),
    };
  }
  if (height > width) {
    return {
      width: width * (parseHeight / height),
      height: parseHeight,
    };
  }
  return {
    width: parseWidth,
    height: parseHeight,
  };
}

interface canvasOptions {
  translate: {
    x: number;
    y: number;
  };
  scale: {
    x: number;
    y: number;
  };
  rotate: {
    angle: number;
  };
}

export function getCanvasOptions(
  width: number,
  height: number,
  orientation: number,
): canvasOptions {
  const options: canvasOptions = {
    translate: {
      x: 0,
      y: 0,
    },
    scale: {
      x: 1,
      y: 1,
    },
    rotate: {
      angle: 0,
    },
  };

  switch (orientation) {
    case 2:
      // horizontal flip
      return {
        ...options,
        translate: {
          ...options.translate,
          x: width,
        },
        scale: {
          ...options.scale,
          x: -1,
        },
      };
    case 3:
      // 180° rotate left
      return {
        ...options,
        translate: {
          x: width,
          y: height,
        },
        rotate: {
          angle: Math.PI,
        },
      };
    case 4:
      // vertical flip
      return {
        ...options,
        translate: {
          ...options.translate,
          y: height,
        },
        scale: {
          ...options.scale,
          y: -1,
        },
      };
    case 5:
      // vertical flip + 90 rotate right
      return {
        ...options,
        scale: {
          ...options.scale,
          x: -1,
        },
        rotate: {
          angle: (90 * Math.PI) / 180,
        },
      };
    case 8:
      // 90° rotate right
      return {
        ...options,
        translate: {
          ...options.translate,
          x: width,
        },
        rotate: {
          angle: (90 * Math.PI) / 180,
        },
      };
    case 7:
      // horizontal flip + 90 rotate right
      return {
        ...options,
        translate: {
          x: width,
          y: height,
        },
        rotate: {
          angle: (90 * Math.PI) / 180,
        },
        scale: {
          ...options.scale,
          y: -1,
        },
      };
    case 6:
      // 90° rotate left
      return {
        ...options,
        translate: {
          ...options.translate,
          y: height,
        },
        rotate: {
          angle: -(90 * Math.PI) / 180,
        },
      };
    default:
      return options;
  }
}
