import { useMemo } from 'react';

const MathJaxRender = ({ children }: { children: any }) => {
  const text = useMemo(() => {
    if (typeof children === 'string') {
      return `$${children}$`;
    }
    return children;
  }, [children]);

  return <span className="mathjax-render-wrapper">{text}</span>;
};

export default MathJaxRender;
