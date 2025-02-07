import { useCallback, useEffect, useMemo, useRef } from 'react';
import CopyWrapper from '../containers/CopyWrapper';
import { useRefreshMath } from '../MathJaxRender/useMathJaxLoad';
import useContentClick from '../hooks/useContentClick';
import type { IRectItem } from '../utils';
import md2html, { mdRender } from './md2html';
import LazyImage from './LazyImage';
import styles from './index.less';
import EditableContent from './EditableContent';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import classNames from 'classnames';
import { flatten } from 'lodash';
import type { ResultJsonUpdateParams } from '../store';
import { ResultType } from '../containers/RightView/RightView';
import { prefixPath } from '@/utils';
import SplitTable from './components/SplitTable';

const MultiPageMarkdown = ({
  data,
  onRectClick,
  onContentClick,
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
  onContentClick?: (e: any) => void;
  dpi?: number;
  dataType?: string;
  markdown?: string;
  markdownMode?: 'view' | 'edit';
  onMarkdownChange?: (params: ResultJsonUpdateParams) => void;
  onSave?: () => void;
  markdownEditorRef: React.MutableRefObject<Vditor | null>;
}) => {
  const latestData = useRef(data);
  latestData.current = data;
  const editorRef = useRef<Vditor | null>(null);
  const markdownContainerRef = useRef<HTMLDivElement | null>(null);

  const getEditorContentId = () =>
    editorRef.current?.vditor.element.parentElement?.dataset.editorContentId;

  const editorContentCanMerge = () => {
    const contentId = getEditorContentId();
    const items = flatten(latestData.current);
    let contentItemIndex = items.findIndex((item) => item?.content_id?.toString() === contentId);
    if (contentItemIndex > -1) {
      const contentItem = items[contentItemIndex];
      let prevContentItem = items[contentItemIndex - 1];
      while (prevContentItem?.content === 1) {
        contentItemIndex -= 1;
        if (contentItemIndex < 0) break;
        prevContentItem = items[contentItemIndex];
      }
      const canMerge =
        prevContentItem &&
        [contentItem, prevContentItem].every(
          (item) => !['table', 'image'].includes(item?.type || '') && item.content !== 1,
        );
      if (canMerge) {
        return contentItem;
      }
    }
  };

  const handleMarkdownChange = ({ contentId, value }: { contentId: string; value: string }) => {
    const contentItem = flatten(latestData.current).find(
      (item) => item?.content_id?.toString() === contentId,
    )!;
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
        cdn: prefixPath + 'vditor@3.10.6',
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
        keydown(event) {
          if (event.key === 'Backspace') {
            const cursorPosition = editorRef.current?.getCursorPosition();
            if (cursorPosition && cursorPosition.left <= 4 && cursorPosition.top <= 14) {
              const contentItemToMerge = editorContentCanMerge();
              if (contentItemToMerge) {
                onMarkdownChange?.({
                  contentItem: { ...contentItemToMerge, custom_edit_continue: true },
                  value: editorRef.current?.getValue() || '',
                });
              }
            }
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
      const contentHtml = markdown && dataType === ResultType.md ? mdRender(markdown) : '';
      return <div dangerouslySetInnerHTML={{ __html: contentHtml }} />;
    }
    let splitPageData: any;
    const pages = data.map((page, pageIndex) => {
      const pageNumber = pageIndex + 1;
      if (Array.isArray(splitPageData) && splitPageData.includes(pageNumber)) {
        const hasContent = page.filter(
          (item) =>
            item.content_id &&
            item.content !== 1 &&
            !['table', 'catalog', 'other'].includes(item.type || ''),
        );
        if (!hasContent.length) return null;
      }
      splitPageData = undefined;
      const lines = Array.isArray(page)
        ? page.map((line) => {
            if (line.type === 'catalog' || line._from_split) return null;
            let text = line.text;
            let markdownText = line.text;
            if (dataType === 'formula' && text) {
              const formula = text.replace(/^\$/, '').replace(/\$$/, '');
              return (
                <div key={line.content_id} data-content-id={line.content_id}>
                  <div className="content-container formula-item" data-content={formula}>
                    <CopyWrapper type="content" />
                    <div>{text}</div>
                  </div>
                </div>
              );
            }
            if (line.type === 'image') {
              const imgSrc = line.base64str
                ? `data:image/jpg;base64,${line.base64str}`
                : line.image_url;
              let chartTable = line.sub_type === 'chart' ? line.text : '';
              if (chartTable && !/^<[a-z]+/.test(chartTable)) {
                chartTable = md2html(chartTable);
              }
              if (!imgSrc) return null;
              const zoom = dpi ? 96 / dpi : undefined;
              return (
                <div
                  id={`content_${line.content_id.toString()}`}
                  key={line.content_id}
                  data-content-id={line.content_id}
                  className="content-container"
                >
                  <CopyWrapper />
                  <LazyImage src={imgSrc} style={{ zoom }} />
                  {/^<table/.test(chartTable) && (
                    <div
                      className="chart-table"
                      dangerouslySetInnerHTML={{ __html: chartTable.replace(/\\/g, '') }}
                    />
                  )}
                </div>
              );
            }
            // 标题
            const isHeaderText =
              typeof line.outline_level === 'number' && line.outline_level !== -1;
            let headTag = '';
            if (isHeaderText) {
              headTag = `h${line.outline_level! + 1}`;
              markdownText = `${'#'.repeat(line.outline_level! + 1)} ${text}`;
              text = `<${headTag}>${text}</${headTag}>`;
            }
            // 非html，进行md渲染
            let isMd = false;
            if (text && line.content !== 1 && !/^<[a-z]+/.test(text)) {
              isMd = true;
              text = md2html(text);
            }
            // 表格
            if (line.type === 'table') {
              const page_ids = [...new Set(line.split_section_page_ids || [])];
              if (page_ids.length > 1) {
                splitPageData = page_ids;
              }
              return (
                <EditableContent
                  key={line.content_id}
                  editorRef={editorRef}
                  contentId={String(line.content_id)}
                  editable={dataType === ResultType.md && markdownMode === 'edit'}
                  value={markdownText}
                  htmlText={text}
                  onChange={handleMarkdownChange}
                  isTable={true}
                >
                  <div
                    key={line.content_id}
                    data-content-id={line.content_id}
                    className={classNames('table-wrapper', { ['md-table']: isMd })}
                  >
                    <SplitTable text={text} data={line} />
                  </div>
                </EditableContent>
              );
            }
            if (splitPageData && line.content === 1) {
              return null;
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
                  data-custom-edit-continue-content-ids={line.custom_edit_continue_content_ids?.join(
                    ',',
                  )}
                  dangerouslySetInnerHTML={{ __html: text || '' }}
                  className={classNames({ ['no-content']: line.content === 1 })}
                />
              </EditableContent>
            );
          })
        : [];
      return (
        <div
          key={pageIndex}
          data-page-number={pageNumber}
          className={classNames({ 'hidden-page': splitPageData })}
        >
          {lines}
        </div>
      );
    });
    return pages;
  }, [data, markdownMode, dataType]);

  useContentClick({ onRectClick, onContentClick, data });

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
