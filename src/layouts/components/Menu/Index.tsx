import { Dropdown, Space, Menu } from 'antd';
import './Index.less';
import { desktopHrefMenu } from '@/layouts/DesktopLayout/constants';

const TextinMenu = () => {};

const TopMenu = () => {
  const TopMenuContent = (
    <Menu>
      {desktopHrefMenu &&
        desktopHrefMenu.map((menuItem) => {
          return (
            <Menu.Item
              icon={<img src={menuItem.icon} style={{ marginRight: '2px' }} />}
              key={menuItem.key}
              onClick={() => {
                const url = menuItem.path;
                const { target } = menuItem;
                window.open(url, target);
              }}
            >
              {menuItem.name}
            </Menu.Item>
          );
        })}
    </Menu>
  );

  return (
    <Space wrap>
      <Dropdown
        overlayClassName="textin-dropdown-menu"
        overlay={TopMenuContent}
        placement="bottomLeft"
      >
        <div className="textin-menu-item">文档与帮助</div>
      </Dropdown>
    </Space>
  );
};

// export default Menu;
export { TextinMenu as default, TopMenu };
