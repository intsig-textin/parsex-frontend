import { Spin } from 'antd';
import { useLocation } from 'umi';
import styles from './Loading.less';
import logo from '@/assets/logo@2x.png';

/**
 * @FIXME: 对于页面嵌套时 子路由加载会首次渲染loading
 */
const childRoutePaths = ['/document/faq/list', '/document/faq/detail/', '/document/api/'];
const Loading = () => {
  const location = useLocation();
  if (childRoutePaths.some((path) => location.pathname.includes(path))) {
    return <></>;
  }
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.logo}>
        <img src={logo} alt="" />
      </div>
      <Spin spinning />
    </div>
  );
};

export default Loading;
