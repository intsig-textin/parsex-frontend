import { useEffect, useMemo, useState } from 'react';
import { isIEBrowser } from '@/utils';
import useExternal from './useExternal';

function useLoadPDF({ onLoad, onError }: { onLoad?: () => void; onError?: () => void } = {}) {
  const [pdfLoad, setLoad] = useState(() => !!(window.pdfjsLib && window.pdfjsWorker));

  const { dir, buildDir, cmapsURL, getParams } = useMemo(() => {
    const versionMap = {
      new: 'https://static.textin.com/deps/pdfjs-dist@2.11.338',
      old: 'https://static.textin.com/deps/pdfjs-dist@2.0.943',
    };
    const isOld = isIEBrowser || !document.body?.attachShadow;
    const dir = isOld ? versionMap.old : versionMap.new;
    return {
      dir,
      buildDir: dir + (isOld ? '' : '/legacy'),
      getParams: (scale: number) => (isOld ? scale : { scale }),
      cmapsURL: `${dir}/cmaps/`,
    };
  }, []);

  // 兼容IE 11 的版本
  const status1 = useExternal(`${buildDir}/build/pdf.min.js`);
  const status2 = useExternal(`${buildDir}/build/pdf.worker.min.js`);

  useEffect(() => {
    if (status1 === 'error' || status2 === 'error') {
      onError?.();
      setLoad(false);
      console.error('pdf load error');
    }
  }, [status1, status2]);

  useEffect(() => {
    (async () => {
      if (window.pdfjsLib && window.pdfjsWorker && !pdfLoad) {
        setLoad(true);
        onLoad?.();
      }
    })();
  }, [status1, status2]);

  return { pdfLoad, dir, buildDir, cmapsURL, getParams };
}

export default useLoadPDF;
