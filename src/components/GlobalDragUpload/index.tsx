import { useEventListener } from 'ahooks';
import type { RcFile } from 'antd/lib/upload';
import type { FC } from 'react';
import { useState } from 'react';
import usePaste from './usePaste';
import styles from './index.less';
interface GlobalDragUploadProps {
  accept?: string;
  multiple?: boolean;
  customRequest?: (file: { file: RcFile }) => void;
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean>;
  onUpload?: (fileList: File[]) => void;
  disabled?: boolean;
}
let tempIndex = 0;
const GlobalDragUpload: FC<GlobalDragUploadProps> = ({
  multiple = true,
  disabled = false,
  onUpload,
  beforeUpload,
  customRequest,
}) => {
  const [show, setShow] = useState(false);
  // console.log('init');
  const doc = document.documentElement;
  const listenerOptions = { target: doc };

  useEventListener('dragleave', (e) => e.preventDefault(), listenerOptions); //拖离
  useEventListener('drop', (e) => e.preventDefault(), listenerOptions); //拖后放
  useEventListener('dragenter', (e) => e.preventDefault(), listenerOptions); //拖进
  useEventListener('dragover', (e) => e.preventDefault(), listenerOptions); //拖来拖去
  useEventListener('dragenter', (e: any) => {
    if (!e.dataTransfer.types.includes('Files')) {
      return;
    }
    if (disabled) {
      return;
    }
    setShow(true);
  });
  useEventListener(
    'dragleave',
    (e: any) => {
      if (disabled) {
        return;
      }
      if (
        e.target.nodeName === 'HTML' ||
        e.target === e.explicitOriginalTarget ||
        (!e.fromElement &&
          (e.clientX <= 0 ||
            e.clientY <= 0 ||
            e.clientX >= window.innerWidth ||
            e.clientY >= window.innerHeight))
      ) {
        setShow(false);
      }
    },
    listenerOptions,
  ); //拖离
  useEventListener(
    'drop',
    (e: any) => {
      if (!e.dataTransfer.types.includes('Files')) {
        return;
      }
      if (disabled) {
        return;
      }
      setShow(false);
      e.preventDefault();
      onDrop(e);
    },
    listenerOptions,
  );
  // const disableDefaultEvents = () => {

  // }
  //   const initDrop = () => {
  //     const ele: any = document.querySelector('body');
  //  //拖进
  //   };
  function onDrop(e: any) {
    // const accept = '.jpg,.png,.ico,.PNG,.doc';
    const list = [].slice.call(e.dataTransfer.files);
    if (!multiple) {
      list.splice(1, list.length - 1);
    }
    list.forEach(async (p) => {
      const files = handleStart(p);
      if (beforeUpload && !(await beforeUpload?.(p, list))) {
        return;
      }
      customRequest?.({ file: files as any as RcFile });
    });
    onUpload?.(list);
  }
  function handleStart(rawFile: RcFile) {
    // eslint-disable-next-line no-plusplus
    rawFile.uid = `rc-${Date.now()}-${tempIndex++}`;

    return rawFile;
    // return {
    //   status: 'ready',
    //   name: rawFile.name,
    //   size: rawFile.size,
    //   percentage: 0,
    //   uid: rawFile.uid,
    //   raw: rawFile,
    // };
  }
  // function checkType(file, accept = '') {
  //   const { type, name } = file;
  //   if (accept.length === 0) return true;
  //   const extension = name.indexOf('.') > -1 ? `.${name.split('.').pop()}` : '';
  //   const baseType = type.replace(/\/.*$/, '');
  //   return accept
  //     .split(',')
  //     .map((type) => type.trim())
  //     .filter((type) => type)
  //     .some((acceptedType) => {
  //       if (/\..+$/.test(acceptedType)) {
  //         return extension === acceptedType;
  //       }
  //       if (/\/\*$/.test(acceptedType)) {
  //         return baseType === acceptedType.replace(/\/\*$/, '');
  //       }
  //       if (/^[^/]+\/[^/]+$/.test(acceptedType)) {
  //         return type === acceptedType;
  //       }
  //     });
  // }

  // ctrl v
  usePaste({
    onPaste: (list) => {
      if (!multiple) {
        list.splice(1, list.length - 1);
      }
      list.forEach(async (p) => {
        const files = handleStart(p);
        if (beforeUpload && !(await beforeUpload?.(p, list))) {
          return;
        }
        customRequest?.({ file: files as any as RcFile });
      });
      onUpload?.(list);
    },
  });

  return (
    <div>
      {show && (
        <div className={styles.mask} id="mask">
          <h3>释放鼠标上传文件</h3>
        </div>
      )}
    </div>
  );
};
export default GlobalDragUpload;
