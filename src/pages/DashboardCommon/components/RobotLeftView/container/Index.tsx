import type { IFileItem } from './RobotFileList/Index';
import FileList from './RobotFileList/Index';
import FooterView from './LeftFooterView/Index';
import { Example, FileListHeader, RecognizeButton } from '../components';
import Upload from './Upload';
import styles from './Index.less';
import { useScroll } from 'ahooks';
import classNames from 'classnames';
import ParamsSelect from '../components/ParamsSelect';

export interface IProps {
  updateFileStatus?: () => void;
  supportCloudOcr?: boolean;
  currentFile: Partial<IFileItem>;
}

export default (props: IProps) => {
  const { top } = useScroll(document.querySelector('.normalFileList') as HTMLElement);

  return (
    <>
      <div
        className={classNames(styles.leftBarTop, {
          [styles.scroll_effect]: top > 0,
        })}
      >
        {/* 示例组件 */}
        <Example />
        <FileListHeader />
        <Upload />
      </div>
      {/* 列表组件 */}
      <FileList />
      <FooterView>
        <RecognizeButton {...props} />
      </FooterView>
      <ParamsSelect />
    </>
  );
};
