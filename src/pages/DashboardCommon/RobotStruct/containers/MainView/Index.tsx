import { useEffect, useMemo, useRef, useState } from 'react';
import type { IFile } from '@/pages/DashboardCommon/components/RobotMainView/Index';
import ImageView from '@/pages/DashboardCommon/components/RobotMainView/Index';
import useAfterLoad from '@/pages/DashboardCommon/RobotMarkdown/hooks/useAfterLoad';
import SVGRect, { getImgWidth } from '@/components/SvgRect/Index';
import { storeContainer } from '../../store';

export type MainViewProps = {
  [key: string]: any;
  onUpload: (fileList: any[]) => void;
  currentFile: IFile;
  showText?: boolean;
};

export default ({ showText = true, autoLink, ...props }: MainViewProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [rate, setRate] = useState(0);
  const [angle, setRotateAngle] = useState(0);

  const { currentFile, curUid, setCurUid, rectList: singleRects } = storeContainer.useContainer();

  const { onLoad, rects } = useAfterLoad(currentFile?.rects);

  const rectList = useMemo(() => {
    return rects.length ? rects : singleRects;
  }, [rects, singleRects]);

  useEffect(() => {
    setCurUid('');
    markRefresh();
  }, [currentFile, rectList]);

  function markRefresh() {
    if (!imgRef.current || (currentFile as IFile)?.status !== 'complete' || !rectList.length) {
      return;
    }
    const naturalWidth = getImgWidth((currentFile as IFile)?.result, imgRef.current);
    setRate(imgRef.current.offsetWidth / naturalWidth);
    setRotateAngle(rectList[0].angle);
  }
  function handleRectFocus(uid: any) {
    setCurUid(uid);
  }

  return (
    <ImageView
      {...props}
      callBack={(props: any) => {
        imgRef.current = props.imgRef?.current;
      }}
      currentFile={currentFile as IFile}
      angle={angle}
      sizeCallBack={markRefresh}
      onLoad={onLoad}
    >
      {rectList?.length && (
        <SVGRect
          rate={rate}
          showText={showText}
          autoLink={autoLink}
          focusId={curUid}
          rectList={rectList}
          onClick={handleRectFocus}
        />
      )}
    </ImageView>
  );
};
