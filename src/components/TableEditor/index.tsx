import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn.js';
import type { FC } from 'react';
import { useState } from 'react';
import styles from './index.less';
import { extractTableFromHTML } from '@/utils/htmlAndMarkdown';
import { useThrottleFn } from 'ahooks';
const TableEditor: FC<{
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
  canMergeCell?: boolean;
}> = ({ style, value, onChange, canMergeCell = true }) => {
  const [changed, setChanged] = useState(false);

  const handleChange = (data: any) => {
    if (changed) {
      onChange?.(extractTableFromHTML(data));
      setChanged(false);
    }
  };

  const { run: throttledHandleChange } = useThrottleFn(
    (data: string) => {
      if (changed) {
        onChange?.(extractTableFromHTML(data));
        setChanged(false);
      }
    },
    { wait: 300 },
  );

  return (
    <div className={styles.tableEditor} style={style}>
      <CKEditor
        config={{
          language: 'zh-cn',
          toolbar: [],
          table: {
            contentToolbar: ['tableColumn', 'tableRow', canMergeCell && 'mergeTableCells'].filter(
              Boolean,
            ) as string[],
          },
          initialData: value,
        }}
        editor={ClassicEditor}
        // data={value}
        onReady={(editor: any) => {
          // You can store the "editor" and use when it is needed.
          // console.log('Editor is ready to use!', editor);
        }}
        onChange={(event: any, editor: any) => {
          setChanged(true);
          const data = editor.getData();
          throttledHandleChange(data);
        }}
        onBlur={(event: any, editor: any) => {
          const data = editor.getData();
          // console.log('Blur.', data);
          // console.log(value,data)
          handleChange(data);
        }}
        onFocus={(event: any, editor: any) => {
          //   console.log('Focus.', editor);
        }}
      />
    </div>
  );
};

export default TableEditor;
