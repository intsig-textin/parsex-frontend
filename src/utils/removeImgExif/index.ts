import { getCanvasOptions, getImage, getOrientation, getSize } from './util';

export async function getUrlFromExifRotateImg(file: string | File) {
  const orientation = await getOrientation(file);
  if (orientation === 0) return file;

  const image = await getImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('canvas can not created');
  }

  const { width, height } = getSize(
    orientation > 4 ? image.height : image.width,
    orientation > 4 ? image.width : image.height,
  );

  canvas.setAttribute('width', `${width}px`);
  canvas.setAttribute('height', `${height}px`);
  const { rotate, translate, scale } = getCanvasOptions(width, height, orientation);
  context.translate(translate.x, translate.y);
  context.scale(scale.x, scale.y);
  context.rotate(rotate.angle);
  // exif orientation values > 4 correspond to portrait orientation.
  // width and height parameters must be swapped for landscape to ensure correct image display

  if (orientation > 4) {
    context.drawImage(image, 0, 0, height, width);
  } else {
    context.drawImage(image, 0, 0, width, height);
  }
  if (typeof file === 'string') {
    return canvas.toDataURL('image/jpeg', 1);
  }
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 1);
  });
}
