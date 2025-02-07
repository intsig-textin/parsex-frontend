import { useCallback } from 'react';
import type { TooltipProps } from 'antd';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import styles from './index.less';

type QuestionToolTipsProps = TooltipProps & {
  iconClassName?: string;
  iconStyle?: React.CSSProperties;
  defaultPopupContainer?: boolean;
};

const QuestionToolTips = ({
  title,
  color = '#2E384D',
  placement = 'topLeft',
  overlayClassName,
  iconClassName,
  iconStyle,
  getPopupContainer,
  defaultPopupContainer,
  children,
  ...rest
}: QuestionToolTipsProps) => {
  const getPopupContainerHandle = useCallback((triggerNode: HTMLElement) => {
    if (getPopupContainer) return getPopupContainer(triggerNode);
    if (defaultPopupContainer) return document.body;
    return triggerNode.parentElement as HTMLElement;
  }, []);

  return (
    <Tooltip
      title={title}
      overlayClassName={classNames(
        styles['tooltips-line'],
        styles['question-tooltips'],
        overlayClassName,
      )}
      color={color}
      placement={placement}
      arrowPointAtCenter
      getPopupContainer={getPopupContainerHandle}
      {...rest}
    >
      <span className={classNames(styles['tips-icon'], iconClassName)} style={iconStyle}>
        {children || <QuestionCircleOutlined />}
      </span>
    </Tooltip>
  );
};

export default QuestionToolTips;
