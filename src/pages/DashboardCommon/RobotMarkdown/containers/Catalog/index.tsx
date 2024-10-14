import { useEffect, useMemo, useState } from 'react';
import { Tree } from 'antd';
import classNames from 'classnames';
import useUploadFormat from '@/pages/DashboardCommon/components/RobotLeftView/store/useUploadFormat';
import ExpandIcon from '@/assets/icon/menu/expandIcon.svg';
import MenuFolder from '@/assets/icon/dashbord/menu-fold.svg';
import { genTableContentTreeList, scrollIntoActiveCatalog } from './utils';
import styles from './index.less';

const Catalog = ({ data: catalog }: { data: any }) => {
  const data = useMemo(() => {
    if (Array.isArray(catalog?.toc)) {
      return catalog.toc.map((item: any) => ({
        ...item,
        level: item.hierarchy,
        content: item.title,
        pageNum: item.page_id - 1,
      }));
    }
    return catalog?.generate;
  }, [catalog]);

  const { collapsed } = useUploadFormat.useContainer();

  const [catalogCollapsed, setCatalogCollapsed] = useState(true);

  const treeData = useMemo(() => {
    return genTableContentTreeList(data);
  }, [data]);

  useEffect(() => {
    setCatalogCollapsed(!collapsed);
  }, [collapsed]);

  const onSelect = (keys: any[], { node }: any) => {
    const index = node.key;
    const item = data[index];
    if (!item) return;
    const pageNumber = item.pageNum + 1; // 从0开始
    scrollIntoActiveCatalog(pageNumber, `catalog${index}`);
  };

  return data?.length ? (
    <div
      className={classNames(styles.catalog, 'catalogViewContainer', {
        [styles['catalog-collapsed']]: catalogCollapsed,
      })}
    >
      <div className={styles.catalogTitle} onClick={() => setCatalogCollapsed((pre) => !pre)}>
        <span>目录</span>
        <img
          src={catalogCollapsed ? ExpandIcon : MenuFolder}
          title={catalogCollapsed ? '展开' : '收起'}
          width={18}
          alt=""
        />
      </div>
      <div className={styles.catalogContent}>
        <Tree treeData={treeData} defaultExpandAll onSelect={onSelect} />
      </div>
    </div>
  ) : null;
};

export default Catalog;
