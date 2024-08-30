import { useEffect, useLayoutEffect, useState } from 'react';
import { useEventListener } from 'ahooks';
import useExternal from '../../components/RobotMainView/PDFToImage/useExternal';
import { prefixPath } from '@/utils';

export const useRefreshMath = (refresh: any) => {
  const refreshHandle = () => {
    window.MathJax.typesetPromise();
  };

  useLayoutEffect(() => {
    if (refresh && window.MathJax?.typesetPromise) {
      requestAnimationFrame(() => {
        refreshHandle();
      });
    }
  }, [refresh]);

  useEventListener(
    'scroll',
    () => {
      refreshHandle();
    },
    {
      target: document.querySelector('.robotResultTabContainer .ant-tabs-content-holder'),
      once: true,
    },
  );

  return { refreshHandle };
};

const useMathJaxLoad = ({ show }: { show: boolean }) => {
  const [url, setUrl] = useState<string>('');

  useExternal(url);

  useEffect(() => {
    if (!show) return;
    if (!window.MathJax) {
      window.MathJax = {
        tex: {
          inlineMath: [
            ['$', '$'],
            ['\\(', '\\)'],
          ],
        },
      };
    }
    setUrl(`${prefixPath}mathjax@3.2.2/es5/tex-mml-chtml.js`);
  }, [show]);
};

export default useMathJaxLoad;
