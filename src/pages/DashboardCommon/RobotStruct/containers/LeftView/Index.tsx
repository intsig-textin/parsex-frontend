import { connect } from 'umi';
import RobotLeftView from '../../../components/RobotLeftView/Index';
import type { IFileItem } from '../../data';

interface IProps {
  // 选中列表文件的回调
  onFileClick: (file: Partial<IFileItem>) => void;
  // 多选的回调
  getChooseList: (list: any) => void;
  // 新上传的文件
  addFileList: any;
  currentFile: any;
}

export const LeftView = ({ onFileClick, getChooseList, addFileList, currentFile }: IProps) => {
  return (
    <>
      <RobotLeftView
        onFileClick={onFileClick}
        getChooseList={getChooseList}
        addFileList={addFileList}
        currentFile={currentFile}
      />
    </>
  );
};

export default connect()(LeftView);
