import { isMobileDevice } from './browser';

/**
 * 1. userAgent 包含移动端设备
 * 2. 屏幕宽度小于768
 */
export const isH5 = isMobileDevice(navigator?.userAgent) && window.screen.width <= 768;

const createH5Meta = () => {
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'viewport');
  meta.setAttribute(
    'content',
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  );
  return meta;
};

if (isH5) {
  document.head.insertBefore(createH5Meta(), document.head.firstChild);
  document.body.classList.add('h5');
}
