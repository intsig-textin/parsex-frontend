import React, { useState } from 'react';
import { Input } from 'antd';
// import { history } from 'umi';
import type { SearchProps } from 'antd/lib/input';
import styles from './index.less';
import SearchBtn from './icon_butt_search_default.svg';
import SearchBtnActive from './icon_butt_search_active.svg';

interface IProps extends SearchProps {
  curName?: string;
  onClick?: () => void;
  isShowSearch?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
  title?: string;
}

export default ({
  curName,
  isShowSearch = true,
  onClick,
  icon,
  placeholder = '请输入机器人名称搜索',
  title,
  ...props
}: IProps) => {
  // const titleName = title || (document.title && document.title.split('-')[1]);
  const [isHover, setIsHover] = useState(false);
  // const handleClick = () => {
  //   if (onClick) {
  //     onClick();
  //     return;
  //   }
  //   history.go(0);
  // };

  return (
    <div className={styles.searchContainer}>
      {/* <div className={styles.title} onClick={handleClick}>
        {curName || titleName}
        {icon}
      </div> */}
      {isShowSearch && (
        <Input.Search
          placeholder={placeholder}
          enterButton={
            <div className={styles.textSlot}>
              <img
                src={isHover ? SearchBtnActive : SearchBtn}
                className={styles.img}
                onMouseLeave={() => {
                  setIsHover(false);
                }}
                onMouseEnter={() => {
                  setIsHover(true);
                }}
              />
            </div>
          }
          size="middle"
          {...props}
        />
      )}
    </div>
  );
};
