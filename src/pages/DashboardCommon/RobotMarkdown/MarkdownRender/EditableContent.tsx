import classNames from 'classnames';
import type { FC, ReactNode } from 'react';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import type Vditor from 'vditor';
import TableEditor from '@/components/TableEditor';
import styles from './index.less';
import { htmlTableToMarkdown, isHtmlTable } from '@/utils/htmlAndMarkdown';

const EditableContent: FC<{
  editorRef: React.MutableRefObject<Vditor | null>;
  contentId: string;
  editable?: boolean;
  value?: string;
  htmlText?: string;
  children: ReactNode;
  isTable?: boolean;
  onChange?: (params: { contentId: string; value: string }) => void;
}> = ({ editorRef, contentId, editable, value, htmlText, children, onChange, isTable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const isMarkdownTable = useMemo(() => {
    return isTable && value && !isHtmlTable(value);
  }, [isTable, value]);

  const handleChange = (newValue: string) => {
    onChange?.({ contentId, value: isMarkdownTable ? htmlTableToMarkdown(newValue) : newValue });
  };

  useEffect(() => {
    if (isTable) {
      return;
    }
    if (isEditing) {
      if (editorRef.current?.vditor && editorContainerRef.current) {
        editorContainerRef.current.appendChild(editorRef.current.vditor.element);
        editorRef.current.setValue(value || '');
        editorRef.current?.focus();
        const vditorNode =
          editorRef.current?.vditor?.element?.querySelector<HTMLElement>('.vditor-ir__node');
        if (vditorNode) {
          vditorNode.click();
        }
      }
    } else {
      // 失焦立即触发onChange
      // if (editorRef.current && onChange) {
      //    debugger;
      //   onChange({ contentId, value: editorRef.current!.getValue() });
      // }
    }
  }, [isEditing, isTable]);

  useEffect(() => {
    // 点击外部区域退出编辑
    const contentContainer = document.querySelector(`#content_${contentId}`);
    document.addEventListener('click', (e) => {
      if (!contentContainer?.contains(e.target as Node)) {
        // if (editorRef.current && onChange) {
        //   onChange({ contentId, value: editorRef.current!.getValue() });
        // }
        setTimeout(() => {
          setIsEditing(false);
        });
      }
    });
  }, []);

  const handleClick = () => {
    if (editable && !isTable) {
      setTimeout(() => {
        setIsEditing(true);
        editorRef.current?.focus();
      });
    }
  };

  return (
    <div id={`content_${contentId}`} data-content-id={contentId} onClick={handleClick}>
      {isTable && (
        <>
          {!editable && <div>{children}</div>}
          {editable && (
            <TableEditor
              style={{ color: '#030a1a' }}
              canMergeCell={!isMarkdownTable}
              value={htmlText}
              onChange={handleChange}
            />
          )}
        </>
      )}
      {!isTable && (
        <>
          <div style={{ display: isEditing ? 'none' : 'block' }}>{children}</div>
          <div
            id={`vditor_${contentId}`}
            ref={editorContainerRef}
            data-editor-content-id={contentId}
            className={classNames(styles.editor, {
              [styles.editMode]: isEditing,
            })}
          />
        </>
      )}
    </div>
  );
};

export default EditableContent;
