import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Pagination, message } from 'antd';
import { useDebounceFn, useSize } from 'ahooks';
import { ReactComponent as OutlineRight } from '@/assets/icon/dashbord/outline-right.svg';
import { ReactComponent as OutlineLeft } from '@/assets/icon/dashbord/outline-left.svg';
import useLoadPDF from '../PDFToImage/useLoadPDF';
import useExternal from '../PDFToImage/useExternal';
import useConvert from '../PDFToImage/useConvert';
import { getParamsSettings } from '../../ParamsSettings/utils';
import { initObserve } from './observe';
import styles from './index.less';

function PDFViewer({
  currentFile,
  getImgRef,
  onLoad,
  onError,
  customTools,
}: {
  currentFile?: any;
  getImgRef?: (ref: any) => any;
  onLoad?: (e: any) => void;
  onError?: (e: any) => void;
  customTools?: (viewer?: any) => void;
}) {
  const [pageInfo, setPageInfo] = useState({
    current: 1,
    total: 0,
  });
  const [status, setStatus] = useState<'no_password'>();
  const [renderRefresh, serRenderRefresh] = useState<any>();
  const { pdfLoad, buildDir, cmapsURL } = useLoadPDF({
    onError: () => onError?.({}),
  });

  const containerRef = useRef<any>();
  const viewerRef = useRef<any>();
  const lockRef = useRef({ url: '', lock: false });
  const timeoutRef = useRef<any>();

  const latestFile = useRef(currentFile);
  latestFile.current = currentFile;

  const viewerCss = useExternal(`${buildDir}/web/pdf_viewer.css`);
  const viewer = useExternal(pdfLoad ? `${buildDir}/web/pdf_viewer.js` : undefined);
  const sandbox = useExternal(pdfLoad ? `${buildDir}/build/pdf.sandbox.js` : undefined);

  const { getBlobUrl } = useConvert();

  const { run: debouncedResize } = useDebounceFn(resize, { wait: 300 });

  const viewContainerSize = useSize(containerRef.current?.parentElement);

  useEffect(() => {
    debouncedResize();
  }, [viewContainerSize.width]);

  useEffect(() => {
    if (currentFile?.rects) {
      initObserve({
        target: containerRef.current,
        rects: currentFile.rects,
        viewerRef: viewerRef.current,
        dpi: currentFile.dpi,
        currentFile,
      });
      if (status === 'no_password' && getParamsSettings()?.pdf_pwd) {
        lockRef.current.lock = false;
        serRenderRefresh(Date.now());
      }
    }
  }, [currentFile?.rects]);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (currentFile?.url) {
      timeoutRef.current = setTimeout(() => {
        onLoad?.({});
        const info = {
          name: 'pdf.js错误',
          keyword: 'pdf_viewer加载超时',
        };
        console.log(info);
      }, 1000 * 2);
    }
  }, [currentFile?.url]);

  useEffect(() => {
    if ([viewerCss, viewer, sandbox].includes('error')) {
      onError?.({});
      const info = {
        name: 'pdf.js错误',
        keyword: 'pdf_viewer加载失败',
        message: {
          'pdf_viewer.css': viewerCss,
          'pdf_viewer.js': viewer,
          'pdf.sandbox.js': sandbox,
        },
      };
      console.log(info);
    }
  }, [viewerCss, viewer, sandbox]);

  useEffect(() => {
    if (
      window.pdfjsSandbox &&
      viewerCss === 'ready' &&
      window.pdfjsViewer &&
      pdfLoad &&
      latestFile.current?.url
    ) {
      // 避免重复渲染
      if (lockRef.current.url === latestFile.current?.url && lockRef.current.lock) {
        return;
      }
      clearTimeout(timeoutRef.current);
      onLoad?.({});
      lockRef.current = { url: latestFile.current.url, lock: true };
      setPageInfo({ total: 0, current: 1 });
      if (viewerRef.current?.setDocument) {
        viewerRef.current.setDocument(null);
      }
      onMounted().catch((error) => {
        if (onError) {
          onError?.({});
        } else {
          message.error('文件预览失败');
          console.log('pdf预览失败', error);
        }
        const info = {
          name: 'pdf.js错误',
          keyword: 'pdf_viewer渲染出错',
          message: error,
        };
        console.log(info);
        if (error?.name === 'PasswordException') {
          setStatus('no_password');
        }
      });
    }
  }, [viewerCss, viewer, sandbox, pdfLoad, renderRefresh]);

  async function onMounted() {
    const DEFAULT_URL = await getBlobUrl({ ...latestFile.current });
    if (!DEFAULT_URL) return;

    const container = containerRef.current;

    const eventBus = new window.pdfjsViewer.EventBus();

    eventBus.on('pagesinit', function () {
      pdfViewer.currentScaleValue = 'page-width';
    });

    /**
     * options
     * https://github.com/mozilla/pdf.js/blob/v2.11.338/web/base_viewer.js#L188-L204
     */
    const pdfViewer = new window.pdfjsViewer.PDFViewer({
      container,
      eventBus,
      annotationMode: 0, // 禁用注释
      removePageBorders: true, // 移除页边框
    });

    /**
     * options
     * https://github.com/mozilla/pdf.js/blob/v2.11.338/src/display/api.js#L320-L328
     */
    const loadingTask = window.pdfjsLib.getDocument({
      password: getParamsSettings()?.pdf_pwd,
      url: DEFAULT_URL,
      cMapUrl: cmapsURL,
      cMapPacked: true,
    });
    const pdfDocument = await loadingTask.promise;
    pdfViewer.setDocument(pdfDocument);

    viewerRef.current = pdfViewer;

    if (typeof customTools === 'function') {
      customTools(viewerRef.current);
    } else {
      registerTools();
    }

    if (latestFile.current.rects) {
      initObserve({
        target: containerRef.current,
        rects: latestFile.current.rects,
        viewerRef: viewerRef.current,
        dpi: latestFile.current.dpi,
        currentFile,
      });
    }
  }

  function registerTools() {
    const operations = document.querySelector('.textin-image-operations');

    if (operations?.children.length === 6 && viewerRef.current) {
      operations.children[0]?.addEventListener('click', () => {
        viewerRef.current.pagesRotation += 90;
      });
      operations.children[1]?.addEventListener('click', () => {
        viewerRef.current.pagesRotation -= 90;
      });
      operations.children[3]?.addEventListener('click', () => {
        viewerRef.current.currentScaleValue = 'page-width';
        viewerRef.current.pagesRotation = 0;
      });
      operations.children[4]?.addEventListener('click', () => {
        viewerRef.current.currentScale += 0.25;
      });
      operations.children[5]?.addEventListener('click', () => {
        viewerRef.current.currentScale -= 0.25;
      });
    }

    setPageInfo((pre) => ({ ...pre, total: viewerRef.current.pdfDocument.numPages }));
    viewerRef.current.eventBus.on('pagechanging', () => {
      setPageInfo((pre) => ({ ...pre, current: viewerRef.current.currentPageNumber }));
    });
  }

  function resize() {
    if (viewerRef.current) {
      viewerRef.current.currentScaleValue = 'page-width';
    }
  }

  function onContainerRef(ref: any) {
    getImgRef?.(ref);
    containerRef.current = ref;
  }

  function onPageChange(current: number) {
    viewerRef.current.currentPageNumber = current;
    setPageInfo((pre) => ({ ...pre, current }));
  }

  const pageItemRender = (current: number, type: string, originalElement: ReactNode) => {
    if (type === 'prev') {
      return <OutlineLeft className={'page_change_icon'} />;
    }
    if (type === 'next') {
      return <OutlineRight className={'page_change_icon'} />;
    }
    return originalElement;
  };

  return (
    <>
      <div id="viewerContainer" ref={onContainerRef} className={styles['pdf-viewer']}>
        <div id="viewer" className="pdfViewer" />
      </div>

      {!!pageInfo.total && (
        <Pagination
          simple
          {...pageInfo}
          pageSize={1}
          itemRender={pageItemRender}
          onChange={onPageChange}
          className={styles['pdf-page']}
        />
      )}
    </>
  );
}

export default PDFViewer;
