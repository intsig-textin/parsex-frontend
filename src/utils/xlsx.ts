import { prefixPath } from './env';

declare global {
  interface Window {
    XLSX: typeof import('xlsx');
  }
}

export const loadXLSX = (): Promise<typeof import('xlsx')> => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
    } else {
      const script = document.createElement('script');
      script.src = `${prefixPath}xlsx.full.min.js`;
      script.async = true;
      script.onload = () => resolve(window.XLSX);
      script.onerror = () => reject(new Error('Failed to load XLSX library'));
      document.head.appendChild(script);
    }
  });
};

loadXLSX();
