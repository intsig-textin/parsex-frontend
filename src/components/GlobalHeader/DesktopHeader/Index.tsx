import { Divider, Layout, Space } from 'antd';
import type { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { menuList } from './constants';
import styles from './Index.less'

const { Header } = Layout;
interface HeaderProps {
  className?: string;
  logo?: ReactNode;
}
const HeaderLayout: FC<HeaderProps> = function ({ className, logo }) {
  return (
    <Header className={classNames('textin-layout-header-container', className)}>
      <div> {logo}</div>
      <Space size={0} align="center" style={{ justifyContent: 'flex-end', height: '100%' }}>
        {menuList.map((menuItem) => {
          const Component = menuItem.component;
          if (Component) {
            return <Component key={menuItem.title} />;
          }
          return (
            <div className={'textin-menu-item'} key={menuItem.title}>
              <a
                className={styles.menuListLink}
                href={menuItem.link}
                key={menuItem.title}
                target={menuItem.target}
              >
                {menuItem.title}
              </a>
            </div>
          );
        })}
      </Space>
    </Header>
  );
};

export default HeaderLayout;
