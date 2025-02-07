import type { IFileItem } from './RobotFileList/Index';
import FileList from './RobotFileList/Index';
import FooterView from './LeftFooterView/Index';
import { Example, FileListHeader, RecognizeButton } from '../components';
import Upload from './Upload';
import styles from './Index.less';
import { useScroll } from 'ahooks';
import classNames from 'classnames';
import RecognizeParamsSettings from '../../RecognizeParamsSettings';
import RobotTour from '../../RobotGuide/RobotTour';

export interface IProps {
  updateFileStatus?: () => void;
  supportCloudOcr?: boolean;
  currentFile: Partial<IFileItem>;
  maxUploadNum?: number;
  showSettings?: boolean;
}

export default (props: IProps) => {
  const { maxUploadNum, showSettings, ...rest } = props;
  const { top } = useScroll(document.querySelector('.normalFileList') as HTMLElement);

  return (
    <>
      <div
        className={classNames(styles.leftBarTop, {
          [styles.scroll_effect]: top > 0,
        })}
      >
        {showSettings && <RecognizeParamsSettings currentFile={rest.currentFile} />}
        <RobotTour showSettings={showSettings} />
        {/* 示例组件 */}
        <Example />
        <FileListHeader />
        <Upload maxUploadNum={maxUploadNum} />
      </div>
      {/* 列表组件 */}
      <FileList />
      <FooterView>
        <RecognizeButton {...rest} />
      </FooterView>
    </>
  );
};
