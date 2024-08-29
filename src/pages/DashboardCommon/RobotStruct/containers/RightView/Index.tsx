import type { FC } from 'react';
import { RightView } from '@/pages/DashboardCommon/components/RobotRightView';
import FooterButton from '../../components/FooterButton';
import type { IFileItem } from '../../data';

interface IProps {
  markdown?: boolean;
  current: IFileItem;
  titleName: string;
  // 左侧批量选中的列表
  currentChoosenList: any;
  resultJson: any;
  service: string;
}

export const RobotRightView: FC<IProps> = ({
  current,
  titleName,
  currentChoosenList,
  children,
  // component,
  resultJson,
  service,
  markdown,
}) => {
  return (
    <RightView
      result={resultJson}
      wrapperClassName="rightViewWrapper result-struct-right-wrapper"
      renderFooter={(currentTab) => {
        return (
          <FooterButton
            {...{
              current,
              titleName,
              currentChoosenList,
              currentTab,
              service,
              markdown,
            }}
          />
        );
      }}
    >
      {children}
    </RightView>
  );
};

export default RobotRightView;
