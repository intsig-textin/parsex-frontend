import type { ImgHTMLAttributes } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useInViewport } from 'ahooks';

const LazyImage = ({ src, ...rest }: ImgHTMLAttributes<HTMLImageElement>) => {
  const ref = useRef(null);
  const [url, setUrl] = useState<string>();
  const inViewport = useInViewport(ref);

  useEffect(() => {
    if (inViewport) {
      setUrl(src);
    }
  }, [inViewport]);

  return <img {...rest} ref={ref} src={url} />;
};

export default LazyImage;
