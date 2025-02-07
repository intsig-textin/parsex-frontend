import type { FC } from 'react';
import { listContainer, fileContainer, formatListContainer } from './store';
import type { IProps as BasicProps } from './container/Index';
import Container from './container/Index';
import { IFileItem } from './data.d';
import ExhaustedModalContainer from '../ExhaustedModal/store';
import ExhaustedModal from '../ExhaustedModal';

export { IFileItem };
interface IProps extends BasicProps {
  addFileList?: File[];
  cloudOcrKeyFromRightView?: string;
  onFileClick: (item: Partial<IFileItem>) => void;
  getChooseList?: (list: IFileItem[]) => void;
  maxUploadNum?: number;
  reserveExif?: boolean;
}

const RobotLeftView: FC<IProps> = (props) => {
  return (
    <ExhaustedModalContainer.Provider>
      <listContainer.Provider>
        <fileContainer.Provider initialState={props}>
          <formatListContainer.Provider initialState={props}>
            <Container {...props} />
            <ExhaustedModal />
          </formatListContainer.Provider>
        </fileContainer.Provider>
      </listContainer.Provider>
    </ExhaustedModalContainer.Provider>
  );
};
export default RobotLeftView;
