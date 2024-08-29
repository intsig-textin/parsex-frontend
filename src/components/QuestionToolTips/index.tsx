import type { TooltipProps } from 'antd';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import styles from './index.less';

type QuestionToolTipsProps = TooltipProps & {
  iconClassName?: string;
};

const QuestionToolTips = ({
  title,
  color = '#2E384D',
  placement = 'topLeft',
  overlayClassName,
  iconClassName,
  getPopupContainer,
  children,
  ...rest
}: QuestionToolTipsProps) => {
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
      getPopupContainer={
        getPopupContainer || ((node: HTMLElement) => node.parentElement as HTMLElement)
      }
      {...rest}
    >
      <span className={classNames(styles['tips-icon'], iconClassName)}>
        {children || <QuestionCircleOutlined />}
      </span>
    </Tooltip>
  );
};

export default QuestionToolTips;
