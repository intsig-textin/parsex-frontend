import type { FC } from 'react';
import type { IFileItem } from '@/pages/DashboardCommon/RobotStruct/data';
import FooterButton from './FooterButton';
import { ResultType } from './RightView';
import RightView from './RightView';

interface IProps {
  markdown?: boolean;
  current: IFileItem;
  titleName: string;
  // 左侧批量选中的列表
  currentChoosenList: any;
  onTabChange?: (type: ResultType) => void;
  resultJson: any;
  service: string;
  disableEdit?: boolean;
}

export const RobotRightView: FC<IProps> = ({
  current,
  titleName,
  currentChoosenList,
  onTabChange,
  children,
  // component,
  resultJson,
  service,
  markdown,
  disableEdit,
}) => {
  return (
    <RightView
      onTabChange={onTabChange}
      result={resultJson}
      wrapperClassName="rightViewWrapper result-struct-right-wrapper"
      renderFooter={(currentTab: any) => {
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
            showCopy={[ResultType.md, ResultType.json].includes(currentTab)}
            showEdit={[ResultType.md].includes(currentTab) && resultJson?.markdown && !disableEdit}
          />
        );
      }}
    >
      {children}
    </RightView>
  );
};

export default RobotRightView;
