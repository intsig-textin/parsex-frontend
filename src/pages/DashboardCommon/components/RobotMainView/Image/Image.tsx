import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import Icon from '@ant-design/icons';
import { Divider } from 'antd';
import { useLocation, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import { getFileNameAndType, isIEBrowser } from '@/utils';
import { mdNoPreview } from '@/services/robot';
import useMarkTool from './hooks/useRobotMark';
import useTool from './hooks/useTool';
import PDFToImage from '../PDFToImage';
import type { IFile } from '../Index';
import styles from './index.less';
import PDFViewer from '../PDFViewer';
import OFDToImage from '../OFDToImage';
import TiffToImage from '../TiffToImage';
import PDFRenderViewer from '../PDFViewer/pdfRender';
interface ICallBackProps {
  imgRef: React.MutableRefObject<HTMLImageElement | null>;
}
export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onClick'> {
  src?: string;
  // oldText 需要旋转角补位
  angleFix?: boolean;
  // 需要旋转的角度
  angle?: number;
  callBack?: ({ imgRef }: ICallBackProps) => void;
  // 当尺寸发生改变 callback
  sizeCallBack?: () => void;
  clearList?: () => void;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  placeholder?: React.ReactNode;
  fallback?: string;
  currentFile?: IFile;
  docConvertToPDF?: boolean;
  reserveExif?: boolean;
}
type ImageStatus = 'normal' | 'error' | 'loading' | 'wait';

const prefixCls = 'textin-image';

const Image: React.FC<ImageProps> = ({
  src,
  height,
  style,
  angle = 0,
  angleFix,
  wrapperClassName,
  wrapperStyle,
  placeholder,
  callBack,
  sizeCallBack,
  clearList,
  fallback,
  children,

  // Img
  crossOrigin,
  onLoad: originOnLoad,
  onError: originOnError,
  decoding,
  sizes,
  srcSet,
  useMap,
  alt,
  currentFile,
  docConvertToPDF = true,
  reserveExif,
}) => {
  const { info: robotInfo } = useSelector(({ Robot, Common }: ConnectState) => ({
    info: Robot.info,
    common: Common,
  }));

  const isCustomPlaceholder = placeholder && placeholder !== true;
  const [status, setStatus] = useState<ImageStatus>(isCustomPlaceholder ? 'loading' : 'wait');
  const [showTransition, setShowTransition] = useState(false);

  const { query }: Record<string, any> = useLocation();

  const isError = status === 'error';
  const hasRobotMark = React.isValidElement(children) && React.Children.only(children);

  const { isPDF, isDoc, isOFD, isTiff } = useMemo(() => {
    const { type } = getFileNameAndType(currentFile?.name || '');
    if (['pdf', 'doc', 'docx'].includes(type) || currentFile?.isPDF) {
      return { isPDF: true, isDoc: docConvertToPDF ? false : ['doc', 'docx'].includes(type) };
    } else if (['ofd'].includes(type)) {
      return { isOFD: true };
    } else if (
      ['tif', 'tiff'].includes(type) &&
      (currentFile?.canToggle ? currentFile.hiddenRects : true)
    ) {
      return { isTiff: true };
    }
    return {};
  }, [currentFile?.name]);

  // 重新识别刷新结果
  const refresh = (currentFile as any).t;
  useEffect(() => {
    if (refresh) {
      onLoad({ target: imgRef.current, type: 'load' });
    }
  }, [refresh]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((children as any)?.props?.rectList) {
      timer = setTimeout(() => {
        setShowTransition(true);
      }, 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [children]);

  const {
    scale,
    imgRef,
    imgContainerRef,
    position,
    tools,
    rotate,
    onMouseDown,
    onWheel,
    resizeScale,
  } = useTool();

  const { updateMark, markStyle } = useMarkTool(imgRef, {
    angle,
    angleFix,
    onSizeChange: sizeCallBack,
    clearList,
    resizeScale,
  });

  const onLoad = (e?: any) => {
    if (!src && !currentFile?.url) return;
    setStatus('normal');
    updateMark();
    if (originOnLoad) originOnLoad(e);
    if (callBack) callBack({ imgRef });
  };

  const onError = (e: any) => {
    setStatus('error');
    if (originOnError) originOnError(e);
    if (callBack) callBack({ imgRef });
  };

  const getImgRef = (img?: HTMLImageElement | null) => {
    if (img) {
      imgRef.current = img;
    }
    if (status !== 'loading') return;
    if (img?.complete && (img.naturalWidth || img.naturalHeight)) {
      onLoad();
    }
  };

  const noTransition = isIEBrowser || !showTransition;
  const imgWrapperClass = classNames(`${prefixCls}-img-wrapper`, {
    [`${prefixCls}-error`]: isError,
    [`${prefixCls}-noTransition`]: noTransition,
  });
  const toolClassName = `${prefixCls}-operations-operation`;
  const iconClassName = `${prefixCls}-operations-icon`;
  const imgCommonProps = {
    crossOrigin,
    decoding,
    sizes,
    srcSet,
    useMap,
    alt,
    className: classNames(`${prefixCls}-img`, {
      [`${prefixCls}-img-placeholder`]: placeholder === true,
      [`${prefixCls}-notEvent`]: React.isValidElement(children),
      [`${prefixCls}-noTransition`]: noTransition,
      [`${prefixCls}-reserveExif`]: reserveExif,
    }),
    style: {
      height,
      ...style,
    },
  };
  const angleBasic = angleFix && angle ? rotate + angle : rotate;
  const isMarkdown = [16].includes(robotInfo.interaction as number);
  const multiple =
    isMarkdown ||
    [
      'pdf_to_markdown',
      'recognize-document-3d1-multipage',
      'receipt_crop_and_recog_multi',
      'recognize_table_multipage',
      'document-multipage',
      'bill_recognize_v2',
      'bank_receipts',
      'open_kie_credentials',
      'customs_declaration',
    ].includes(query.service);

  const pdfView = isPDF && multiple && !isDoc;
  const hasDocparser = !!currentFile?.parserPages?.length;
  const isVLMView = isPDF && [18].includes(robotInfo.interaction as number);
  // const isMDView = isMarkdown && mdNoPreview(currentFile?.name || '');
  const isMDView = isMarkdown;
  const parserView = isVLMView || isMDView;
  const useDocparserImg = hasDocparser && parserView;
  const customPreview = pdfView || useDocparserImg;
  const noImage = isOFD || isPDF || isTiff || parserView;

  return (
    <>
      <div
        id="imgContainer"
        onWheel={customPreview ? undefined : (onWheel as any)}
        ref={imgContainerRef}
        className={classNames(wrapperClassName, { [styles['pdf-viewer']]: customPreview })}
        style={wrapperStyle}
      >
        <div
          className={imgWrapperClass}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          }}
        >
          {useDocparserImg && (
            <PDFRenderViewer
              onLoad={onLoad}
              onError={onError}
              getImgRef={getImgRef}
              currentFile={currentFile}
              scale={scale}
              angle={rotate}
            />
          )}

          {!useDocparserImg && pdfView && (
            <PDFViewer
              onLoad={onLoad}
              onError={onError}
              getImgRef={getImgRef}
              currentFile={currentFile}
            />
          )}
          {!useDocparserImg && isPDF && !multiple && (
            <PDFToImage
              {...imgCommonProps}
              onLoad={onLoad}
              onError={onError}
              onMouseDown={onMouseDown}
              getImgRef={getImgRef}
              fallback={fallback}
              currentFile={currentFile}
              style={{
                transform: `scale(${scale}, ${scale}) rotate(${rotate}deg)`,
              }}
            />
          )}
          {isOFD && (
            <OFDToImage
              {...imgCommonProps}
              onLoad={onLoad}
              onError={onError}
              onMouseDown={onMouseDown}
              getImgRef={getImgRef}
              fallback={fallback}
              currentFile={currentFile}
              style={{
                transform: `scale(${scale}, ${scale}) rotate(${rotate}deg)`,
              }}
            />
          )}
          {isTiff && (
            <TiffToImage
              {...imgCommonProps}
              onLoad={onLoad}
              onError={onError}
              onMouseDown={onMouseDown}
              getImgRef={getImgRef}
              fallback={fallback}
              currentFile={currentFile}
              style={{
                transform: `scale(${scale}, ${scale}) rotate(${rotate}deg)`,
              }}
            />
          )}
          {!noImage && isError && fallback && <img {...imgCommonProps} src={fallback} />}
          {!isError &&
            src &&
            (!noImage || (!useDocparserImg && !pdfView && !isPDF && !isTiff && !isOFD)) && (
              <img
                {...imgCommonProps}
                onLoad={onLoad}
                onError={onError}
                src={src}
                onMouseDown={onMouseDown}
                ref={getImgRef}
                style={{
                  transform: `scale(${scale}, ${scale}) rotate(${rotate}deg)`,
                }}
              />
            )}
          {hasRobotMark && !customPreview && (
            <div
              className={classNames(`${prefixCls}-robot-mark`, {
                [`${prefixCls}-noTransition`]: noTransition, // 旋转的动画
              })}
              style={{
                transform: `scale(${scale}, ${scale}) rotate(${angleBasic}deg)`,
                ...markStyle,
              }}
              onMouseDown={onMouseDown}
            >
              {children}
            </div>
          )}
          {status === 'loading' && (
            <div aria-hidden="true" className={`${prefixCls}-placeholder`}>
              {placeholder}
            </div>
          )}
        </div>
      </div>
      <div
        className={classNames({
          [styles['custom-viewer-footer']]: customPreview,
        })}
      >
        <ul className={`${prefixCls}-operations`} onMouseEnter={() => setShowTransition(true)}>
          {status === 'normal' &&
            tools.map(({ Icon: IconSvg, onClick, type, disabled, ...props }) => {
              return (
                <li
                  className={classNames({
                    [`${prefixCls}-operations-operation-disabled`]: !!disabled,
                    [`${prefixCls}-operations-line`]: type === 'line',
                    [toolClassName]: type !== 'line',
                  })}
                  onClick={onClick}
                  key={type}
                >
                  {type === 'line' ? (
                    <Divider type="vertical" />
                  ) : (
                    <Icon component={IconSvg as any} className={iconClassName} {...props} />
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    </>
  );
};
export default Image;
