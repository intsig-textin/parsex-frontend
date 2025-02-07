import { useEffect, useState } from 'react';
import type { IRectItem } from '../utils';

const useAfterLoad = (data?: IRectItem[][]) => {
  const [isImg, setIsImg] = useState(false);
  const [rects, setRectList] = useState<{ uid: any; points: number[]; [key: string]: any }[]>([]);

  useEffect(() => {
    if (isImg && Array.isArray(data) && data[0] && setRectList) {
      setRectList(
        data[0]
          .map((item: IRectItem, i) => ({
            uid: item.content_id,
            points: item.position,
            type: item.type,
            angle: item.angle || 0,
            renderText: item.render_text,
            sort: ['category'].includes(item.type as string) ? i - 10000 : i,
            cells: item.cells,
          }))
          .sort((a, b) => a.sort - b.sort),
      );
    } else {
      setRectList([]);
    }
  }, [isImg, data]);

  const onLoad = (e: any) => {
    setIsImg(e?.target?.tagName === 'IMG');
  };

  return { onLoad, rects };
};

export default useAfterLoad;
