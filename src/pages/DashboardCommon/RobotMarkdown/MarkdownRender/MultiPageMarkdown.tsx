import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRefreshMath } from '../MathJaxRender/useMathJaxLoad';
import useContentClick from '../hooks/useContentClick';
import type { IRectItem } from '../utils';
import md2html, { getFormula } from './md2html';
import LazyImage from './LazyImage';
import styles from './index.less';
import CopyWrapper from '../containers/CopyWrapper';
import EditableContent from './EditableContent';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import classNames from 'classnames';
import { flatten } from 'lodash';
import type { ResultJsonUpdateParams } from '../../RobotStruct/store';
import { ResultType } from '../containers/RightView/RightView';

const MultiPageMarkdown = ({
  data,
  onRectClick,
  dpi,
  dataType,
  markdown,
  markdownMode = 'view',
  onMarkdownChange,
  markdownEditorRef,
  onSave,
}: {
  data: IRectItem[][];
  onRectClick?: (e: any) => void;
  dpi?: number;
  dataType?: string;
  markdown?: string;
  markdownMode?: 'view' | 'edit';
  onMarkdownChange?: (params: ResultJsonUpdateParams) => void;
  onSave?: () => void;
  markdownEditorRef: React.MutableRefObject<Vditor | null>;
}) => {
  const editorRef = useRef<Vditor | null>(null);
  const markdownContainerRef = useRef<HTMLDivElement | null>(null);

  const getEditorContentId = () =>
    editorRef.current?.vditor.element.parentElement?.dataset.editorContentId;

  const handleMarkdownChange = ({ contentId, value }: { contentId: string; value: string }) => {
    const contentItem = flatten(data).find((item) => item.content_id?.toString() === contentId)!;
    // console.log('changed', contentItem, value);
    // debugger
    // const newMarkdown = editorRef.current?.html2md(markdownContainerRef.current?.innerHTML!);
    if (contentItem) {
      onMarkdownChange?.({ value, contentItem });
    }
  };

  useEffect(() => {
    const vditor =
      editorRef.current ||
      new Vditor(`vditor`, {
        cdn: 'https://static.textin.com/deps/' + 'vditor@3.10.6',
        mode: 'ir',
        after: () => {
          editorRef.current = vditor;
        },
        input(value) {
          const contentId = getEditorContentId();
          if (contentId) {
            handleMarkdownChange({ contentId, value });
          }
        },
        blur(value) {
          const contentId = getEditorContentId();
          if (contentId) {
            handleMarkdownChange({ contentId, value });
          }
        },
        toolbar: [],
        toolbarConfig: {
          hide: true,
        },
        cache: {
          enable: false,
        },
      });
    markdownEditorRef.current = vditor;
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
      markdownEditorRef.current?.destroy();
      markdownEditorRef.current = null;
    };
  }, []);

  // 快捷键保存
  const save = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        console.log('save', dataType, markdownMode);
        if (dataType === ResultType.md && markdownMode === 'edit') {
          editorRef.current?.blur();
          setTimeout(() => {
            onSave?.();
          });
          e.preventDefault();
        }
      }
    },
    [dataType, markdownMode, onSave],
  );
  useEffect(() => {
    document.addEventListener('keydown', save, false);
    return () => {
      document.removeEventListener('keydown', save, false);
    };
  }, [save]);

  const content = useMemo(() => {
    if (!Array.isArray(data)) {
      const contentHtml = data ? md2html(data) : '';
      return <div dangerouslySetInnerHTML={{ __html: contentHtml }} />;
    }
    const pages = data.map((page, pageIndex) => {
      const lines = Array.isArray(page)
        ? page.map((line) => {
            if (line.type === 'catalog') return null;
            let text = line.text;
            let markdownText = line.text;
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
                  id={`content_${line.content_id.toString()}`}
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
            const isHeaderText =
              typeof line.outline_level === 'number' && line.outline_level !== -1;
            if (isHeaderText) {
              const headTag = `h${line.outline_level! + 1}`;
              markdownText = `${'#'.repeat(line.outline_level! + 1)} ${text}`;
              text = `<${headTag}>${text}</${headTag}>`;
            }
            // 非html，进行md渲染
            if (text && !/^<[a-z]+/.test(text)) {
              text = md2html(text);
            }
            // 表格
            if (line.type === 'table') {
              // return (
              //   <div
              //     key={line.content_id}
              //     data-content-id={line.content_id}
              //     className="content-container"
              //   >
              //     <CopyWrapper />
              //     <div dangerouslySetInnerHTML={{ __html: text || '' }} />
              //   </div>
              // );

              // markdownText = editorRef.current?.html2md(text) || '';
              return (
                <EditableContent
                  key={line.content_id}
                  editorRef={editorRef}
                  contentId={String(line.content_id)}
                  editable={dataType === ResultType.md && markdownMode === 'edit'}
                  value={markdownText}
                  onChange={handleMarkdownChange}
                >
                  <div
                    key={line.content_id}
                    data-content-id={line.content_id}
                    className="content-container"
                  >
                    <CopyWrapper />
                    <div dangerouslySetInnerHTML={{ __html: text || '' }} />
                  </div>
                </EditableContent>
              );
            }
            return (
              <EditableContent
                key={line.content_id}
                editorRef={editorRef}
                contentId={String(line.content_id)}
                editable={dataType === ResultType.md && markdownMode === 'edit'}
                value={markdownText}
                onChange={handleMarkdownChange}
              >
                <div
                  key={line.content_id}
                  data-content-id={line.content_id}
                  dangerouslySetInnerHTML={{ __html: text || '' }}
                />
              </EditableContent>
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
  }, [data, markdownMode]);

  useContentClick({ onRectClick });

  useRefreshMath(content);

  return (
    <div
      className={classNames(styles['markdown-body'], {
        [styles.markdownBodyEditMode]: markdownMode === 'edit',
      })}
    >
      <div id="markdownContent" ref={markdownContainerRef}>
        {content}
      </div>
      <div id="vditor" className={classNames(styles.editor)} />
    </div>
  );
};

export default MultiPageMarkdown;
