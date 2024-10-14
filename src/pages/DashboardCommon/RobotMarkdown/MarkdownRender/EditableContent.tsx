import classNames from 'classnames';
import type { FC, ReactNode } from 'react';
import React, { useEffect, useState, useRef } from 'react';
import type Vditor from 'vditor';
import styles from './index.less';

const EditableContent: FC<{
  editorRef: React.MutableRefObject<Vditor | null>;
  contentId: string;
  editable?: boolean;
  value?: string;
  children: ReactNode;
  onChange?: (params: { contentId: string; value: string }) => void;
}> = ({ editorRef, contentId, editable, value, children, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [isEditing]);

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
    if (editable) {
      setTimeout(() => {
        setIsEditing(true);
        editorRef.current?.focus();
      });
    }
  };

  return (
    <div id={`content_${contentId}`} onClick={handleClick}>
      <div style={{ display: isEditing ? 'none' : 'block' }}>{children}</div>
      <div
        id={`vditor_${contentId}`}
        ref={editorContainerRef}
        data-editor-content-id={contentId}
        className={classNames(styles.editor, {
          [styles.editMode]: isEditing,
        })}
      />
    </div>
  );
};

export default EditableContent;
