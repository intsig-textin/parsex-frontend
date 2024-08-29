import { message } from 'antd';
import { ReactComponent as CopyIcon } from '@/assets/icon/copy.svg';
import { copy } from '@/utils';

const CopyWrapper = ({ type }: { type?: 'content' }) => {
  const onCopyHandle = (e: any) => {
    try {
      const wrapper: HTMLDivElement = e.currentTarget.parentElement;
      if (!wrapper || !wrapper.className?.includes('content-container'))
        throw new Error('no wrapper');

      if (type === 'content') {
        const text = wrapper.dataset.content || '';
        copy(text);
        message.success('复制成功');
        return;
      }

      const node = wrapper.cloneNode(true) as HTMLDivElement;

      node.style.position = 'fixed';
      node.style.top = `200px`;
      node.style.left = '110%';

      document.body.appendChild(node);
      const selection = window.getSelection();
      if (!selection) throw new Error('no selection');
      selection.removeAllRanges();
      const range = document.createRange();
      if (!range) throw new Error('no range');
      range.selectNodeContents(node);
      selection.addRange(range);
      document.execCommand('copy');

      message.success('复制成功');

      setTimeout(function () {
        document.body.removeChild(node);
      }, 100);
    } catch (error) {
      console.log('error', error);
      message.error('复制失败');
    }
  };

  return <CopyIcon className="copy-handle" onClick={onCopyHandle} />;
};

export default CopyWrapper;
