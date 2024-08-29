import type { FC } from 'react';
import { listContainer, fileContainer, formatListContainer } from './store';
import type { IProps as BasicProps } from './container/Index';
import Container from './container/Index';
import ThumbContainer from './container/ThumbView/Index';
import { IFileItem } from './data.d';

export { IFileItem };
interface IProps extends BasicProps {
  clearExif?: boolean;
  addFileList?: File[];
  cloudOcrKeyFromRightView?: string;
  onFileClick: (item: Partial<IFileItem>) => void;
  getChooseList?: (list: IFileItem[]) => void;
}

const RobotLeftView: FC<IProps> = (props) => {
  return (
    <listContainer.Provider>
      <fileContainer.Provider initialState={props}>
        <formatListContainer.Provider initialState={props}>
          <Container {...props} />
        </formatListContainer.Provider>
      </fileContainer.Provider>
    </listContainer.Provider>
  );
};
export default RobotLeftView;

interface IThumbProps {
  currentFile: Partial<IFileItem>;
  onFileClick: (item: Partial<IFileItem>) => void;
  addFileList?: File[];
  getChooseList?: (list: IFileItem[]) => void;
}

export const RobotLeftThumbView: FC<IThumbProps> = (props) => {
  return (
    <listContainer.Provider>
      <fileContainer.Provider initialState={props}>
        <formatListContainer.Provider initialState={props}>
          <ThumbContainer {...props} />
        </formatListContainer.Provider>
      </fileContainer.Provider>
    </listContainer.Provider>
  );
};
