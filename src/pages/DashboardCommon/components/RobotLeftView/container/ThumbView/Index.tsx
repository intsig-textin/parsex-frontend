import { listContainer } from '../../store';
import ThumbExample from '../ThumbExample/Index';
import ThumbFileList from '../ThumbFileList/Index';
// import ThumbFooterView from '../ThumbFooterView/Index';
import { PayModal, RecognizeButton } from '../../components';
import styles from './Index.less';
import ThumbLeftFooterView from '../ThumbLeftFooterView';
import type { IFileItem } from '../../data';
export interface IProps {
  updateFileStatus?: () => void;
  supportCloudOcr?: boolean;
  currentFile: Partial<IFileItem>;
}
export default (props: IProps) => {
  const { payModal } = listContainer.useContainer();

  return (
    <div className={styles.robotLeftThumbContainer}>
      <ThumbExample />
      <ThumbFileList />
      <PayModal {...payModal} />
      <ThumbLeftFooterView>
        <RecognizeButton {...props} />
      </ThumbLeftFooterView>
    </div>
  );
};
