import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useImperativeHandle } from 'react';
import { useLayoutEffect, useState, forwardRef } from 'react';
import { useSize } from 'ahooks';
import { Tooltip } from 'antd';
import type { TooltipProps } from 'antd/lib/tooltip';
import styles from './index.less';
import { createPortal } from 'react-dom';
export interface ForwardRefExoticMethod {
  next: () => void;
  prev: () => void;
}
export interface StepItem {
  target: string;
  render?: (params: {
    curStep: number;
    total: number;
    next: ForwardRefExoticMethod['next'];
    prev: ForwardRefExoticMethod['prev'];
    onClose?: () => void;
  }) => any;
  beforeRender?: () => void;
  tooltipProps?: Omit<TooltipProps, 'overlay'>;
  desc?: string;
}

interface GuideProp {
  steps: StepItem[];
  toolTipRender?: StepItem['render'];
  //   uniqueKey: string;
  visible?: boolean;
  onClose?: () => void;
}

interface CurGuideProp {
  wrapperStyle?: CSSProperties;
  toolTipContentRender: () => any;
  tooltipProps?: Omit<TooltipProps, 'overlay'>;
}

const padding = 8;

/**
 * 引导
 */
const GuideSteps = forwardRef<ForwardRefExoticMethod, GuideProp>(
  ({ steps, toolTipRender, visible = true, onClose }, ref) => {
    const [curStep, setCueStep] = useState(0);
    const [curGuide, setCurGuide] = useState<CurGuideProp>();

    const domRef = useRef<HTMLDivElement>(null);
    const wrapSize = useSize(document.body);
    const nextStep = () => {
      if (curStep >= steps.length - 1) return;
      setCueStep(curStep + 1);
    };
    const preStep = () => {
      if (curStep === 0) return;
      setCueStep(curStep - 1);
    };
    useImperativeHandle(ref, () => {
      return {
        next: nextStep,
        prev: preStep,
      };
    });
    //   const [message, setMessage] = useLocalStorageState(uniqueKey, {});

    //   const { userInfo } = userModelContainer.useContainer();

    //   const userMessage =
    //     userInfo.openId && message && typeof message === 'object' && message[userInfo.openId];

    //   const show = useMemo(() => {
    //     if (!userInfo.openId || !message) return false;
    //     if (userMessage) {
    //       return !dayjs().isSame(dayjs(userMessage?.date), 'day');
    //     }
    //     return true;
    //   }, []);
    useLayoutEffect(() => {
      if (visible && Array.isArray(steps) && steps?.length) {
        const cur = steps[curStep];

        if (!cur) return;
        const { target, render, beforeRender, tooltipProps } = cur;
        const targetDom = document.querySelector(target);
        const renderHandle = toolTipRender || render;
        if (!targetDom || !renderHandle) return;
        if (typeof beforeRender === 'function') {
          beforeRender();
        }
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
          const { width: bodyWidth, height: bodyHeight } = document.body.getBoundingClientRect();
          const { width, height, top, right, left, bottom } = targetDom.getBoundingClientRect();

          setCurGuide({
            wrapperStyle: {
              width: width + padding * 2,
              height: height + padding * 2,
              borderTopWidth: top - padding,
              borderRightWidth: bodyWidth - right - padding,
              borderBottomWidth: bodyHeight - bottom - padding,
              borderLeftWidth: left - padding,
              borderColor: 'rgba(3, 10, 26, 0.6)',
            },
            toolTipContentRender: () =>
              renderHandle({
                curStep,
                total: steps.length,
                next: nextStep,
                prev: preStep,
                ...(onClose ? { onClose } : {}),
              }),
            tooltipProps,
          });
        }, 100);
      }
    }, [steps, curStep, wrapSize, visible]);
    const wrapper = useMemo(() => {
      const dom = document.createElement('div');
      document.body.appendChild(dom);
      return dom;
    }, []);
    const close = () => {
      setCueStep(0);
      document.body.style.overflow = '';
    };
    useEffect(() => {
      if (!visible) {
        close();
      }
      return () => {
        document.body.removeChild(wrapper);
        close();
      };
    }, [visible]);

    if (!curGuide || curStep < 0 || !visible) {
      return null;
    }

    const { wrapperStyle, toolTipContentRender, tooltipProps = {} } = curGuide;

    return createPortal(
      <div ref={domRef} className={styles['guide-steps-wrapper']} style={wrapperStyle}>
        <Tooltip
          title={toolTipContentRender}
          {...tooltipProps}
          visible
          overlayClassName="guide_tooltips"
          // align={{
          //   offset:[12,12]
          // }}
          destroyTooltipOnHide
        >
          <div style={{ width: '100%', height: '100%' }} />
        </Tooltip>
      </div>,
      wrapper,
    );
  },
);

export default GuideSteps;
