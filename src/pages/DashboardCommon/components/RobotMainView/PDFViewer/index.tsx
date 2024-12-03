import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Pagination, message } from 'antd';
import { useEventListener, useSize } from 'ahooks';
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
  const { pdfLoad, buildDir, cmapsURL } = useLoadPDF({
    onError: () => onError?.({}),
  });

  const containerRef = useRef();
  const viewerRef = useRef<any>();
  const lockRef = useRef({ url: '', lock: false });
  const timeoutRef = useRef<any>();

  const latestFile = useRef(currentFile);
  latestFile.current = currentFile;

  const viewerCss = useExternal(`${buildDir}/web/pdf_viewer.css`);
  const viewer = useExternal(pdfLoad ? `${buildDir}/web/pdf_viewer.js` : undefined);
  const sandbox = useExternal(pdfLoad ? `${buildDir}/build/pdf.sandbox.js` : undefined);

  const { getBlobUrl } = useConvert();

  useEventListener('resize', resize, { target: window });

  useEventListener(
    'transitionend',
    (e: any) => {
      if (e.propertyName === 'width') {
        resize();
      }
    },
    { target: document.querySelector('.imgContainer') },
  );

  // useEventListener(
  //   'transitionend',
  //   (e: any) => {
  //     if (e.propertyName === 'width') {
  //       resize();
  //     }
  //   },
  //   { target: document.querySelector('.catalogViewContainer') },
  // );

  const catalogSize = useSize(document.querySelector('.catalogViewContainer') as HTMLElement);

  useEffect(() => {
    resize();
  }, [catalogSize]);

  useEffect(() => {
    if (currentFile?.rects) {
      initObserve({
        target: containerRef.current,
        rects: currentFile.rects,
        viewerRef: viewerRef.current,
        dpi: currentFile.dpi,
      });
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
      });
    }
  }, [viewerCss, viewer, sandbox, pdfLoad]);

  async function onMounted() {
    const CMAP_URL = cmapsURL;
    const CMAP_PACKED = true;

    const DEFAULT_URL = await getBlobUrl({ ...latestFile.current });
    if (!DEFAULT_URL) return;

    const ENABLE_XFA = true;
    const SEARCH_FOR = ''; // try "Mozilla";

    const SANDBOX_BUNDLE_SRC = window.pdfjsSandbox;

    const container = containerRef.current;

    const eventBus = new window.pdfjsViewer.EventBus();

    // (Optionally) enable hyperlinks within PDF files.
    const pdfLinkService = new window.pdfjsViewer.PDFLinkService({
      eventBus,
    });

    // (Optionally) enable find controller.
    const pdfFindController = new window.pdfjsViewer.PDFFindController({
      eventBus,
      linkService: pdfLinkService,
    });

    // (Optionally) enable scripting support.
    const pdfScriptingManager = new window.pdfjsViewer.PDFScriptingManager({
      eventBus,
      sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
    });

    const pdfViewer = new window.pdfjsViewer.PDFViewer({
      container,
      eventBus,
      linkService: pdfLinkService,
      findController: pdfFindController,
      scriptingManager: pdfScriptingManager,
      enableScripting: true, // Only necessary in PDF.js version 2.10.377 and below.
    });
    pdfLinkService.setViewer(pdfViewer);
    pdfScriptingManager.setViewer(pdfViewer);

    eventBus.on('pagesinit', function () {
      // We can use pdfViewer now, e.g. let's change default scale.
      pdfViewer.currentScaleValue = 'page-width';

      // We can try searching for things.
      if (SEARCH_FOR) {
        eventBus.dispatch('find', { type: '', query: SEARCH_FOR });
      }
    });

    // Loading document.
    const loadingTask = window.pdfjsLib.getDocument({
      password: getParamsSettings()?.pdf_pwd,
      url: DEFAULT_URL,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
      enableXfa: ENABLE_XFA,
    });
    const pdfDocument = await loadingTask.promise;
    // Document loaded, specifying document for the viewer and
    // the (optional) linkService.
    pdfViewer.setDocument(pdfDocument);

    pdfLinkService.setDocument(pdfDocument, null);

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
