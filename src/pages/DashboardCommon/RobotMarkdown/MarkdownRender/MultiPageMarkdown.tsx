import { useMemo } from 'react';
import { useRefreshMath } from '../MathJaxRender/useMathJaxLoad';
import useContentClick from '../hooks/useContentClick';
import type { IRectItem } from '../utils';
import md2html, { getFormula } from './md2html';
import LazyImage from './LazyImage';
import styles from './index.less';
import CopyWrapper from '../containers/CopyWrapper';

const MultiPageMarkdown = ({
  data,
  onRectClick,
  dpi,
  dataType,
}: {
  data: IRectItem[][];
  onRectClick?: (e: any) => void;
  dpi?: number;
  dataType?: string;
}) => {
  const content = useMemo(() => {
    if (!Array.isArray(data)) return data || '';
    const pages = data.map((page, pageIndex) => {
      const lines = Array.isArray(page)
        ? page.map((line) => {
            if (line.type === 'catalog') return null;
            let text = line.text;
            if (dataType === 'formula' && text) {
              const formulas = getFormula(text);
              return (
                <div key={line.content_id} data-content-id={line.content_id}>
                  {formulas.map((item, i) => (
                    <div
                      className="content-container formula-item"
                      key={`${line.content_id}_${i}`}
                      data-content={item}
                    >
                      <CopyWrapper type="content" />
                      <div>{'$' + item + '$'}</div>
                    </div>
                  ))}
                </div>
              );
            }
            if (line.type === 'image' && line.image_url) {
              const zoom = dpi ? 96 / dpi : undefined;
              return (
                <div
                  key={line.content_id}
                  data-content-id={line.content_id}
                  className="content-container"
                >
                  <CopyWrapper />
                  <LazyImage src={line.image_url} style={{ zoom }} />
                </div>
              );
            }
            // 标题
            if (typeof line.outline_level === 'number' && line.outline_level !== -1) {
              const headTag = `h${line.outline_level + 1}`;
              text = `<${headTag}>${text}</${headTag}>`;
            }
            // 非html，进行md渲染
            if (text && !/^<[a-z]+/.test(text)) {
              text = md2html(text);
            }
            if (line.type === 'table') {
              return (
                <div
                  key={line.content_id}
                  data-content-id={line.content_id}
                  className="content-container"
                >
                  <CopyWrapper />
                  <div dangerouslySetInnerHTML={{ __html: text || '' }} />
                </div>
              );
            }
            return (
              <div
                key={line.content_id}
                data-content-id={line.content_id}
                dangerouslySetInnerHTML={{ __html: text || '' }}
              />
            );
          })
        : [];
      return (
        <div key={pageIndex} data-page-number={pageIndex + 1}>
          {lines}
        </div>
      );
    });
    return pages;
  }, [data]);

  useContentClick({ onRectClick });

  useRefreshMath(content);

  return <div className={styles['markdown-body']}>{content}</div>;
};

export default MultiPageMarkdown;
