import { useEventListener } from 'ahooks';

function usePaste({ onPaste }: { onPaste: (files: any[]) => void }) {
  useEventListener('paste', (e) => {
    if (e.clipboardData?.items) {
      const files: any[] = [];
      for (let i = 0, len = e.clipboardData.items.length; i < len; i++) {
        const item = e.clipboardData.items[i];
        if (item.kind === 'file') {
          const pasteFile = item.getAsFile();
          files.push(pasteFile);
        }
      }
      if (files.length) {
        onPaste?.(files);
      }
    }
  });
}

export default usePaste;
