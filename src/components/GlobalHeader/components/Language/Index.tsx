import React, { useState, useEffect } from 'react';
import type { Dispatch } from 'umi';
import { connect, history } from 'umi';
import { Popover } from 'antd';
import type { ConnectState, ICommonModelState } from '@/models/connect';
import { isMobile } from '@/utils';
import styles from './Language.less';
import DownOut from '@/assets/icon/icon_region_unfold.png';

interface ILanguageProp {
  name: string;
  value: string;
  fullValue?: string;
}

const LanguageList: ILanguageProp[] = [
  {
    name: '中文',
    value: 'CN',
    fullValue: 'zh-CN',
  },
  {
    name: 'English',
    value: 'EN',
    fullValue: 'en-US',
  },
];

const LanguageSelect = (props: { Common: ICommonModelState; dispatch: Dispatch }) => {
  const {
    Common: { language },
    dispatch,
  } = props;
  const [currentLang, setCurrentLang] = useState(language);
  useEffect(() => {
    const langItem = LanguageList.find((item) => item.value === language);
    setCurrentLang(langItem ? langItem.name : '中文');
  }, [language]);
  const onChangeLanguage = (language: ILanguageProp) => {
    dispatch({
      type: 'Common/setLanguage',
      payload: {
        language: 'EN',
      },
    });
    setCurrentLang(language.name);
    if (language.value === 'EN') {
      history.push('/dashboard/en');
    } else {
      history.push('/dashboard/robot');
    }
  };
  const LanguageContent = () => {
    return LanguageList.map((language: ILanguageProp, index) => {
      return (
        <div
          onClick={() => onChangeLanguage(language)}
          className={`${styles.langItem} ${currentLang === language.name ? styles.active : ''}`}
          key={index}
        >
          {language.name}
        </div>
      );
    });
  };
  return (
    <Popover
      overlayClassName="textin-language-popover"
      trigger={isMobile() ? 'click' : 'hover'}
      placement="bottom"
      content={LanguageContent}
    >
      <div className={styles.langTip}>
        <span>{currentLang}</span>
        <img src={DownOut} className={styles.icon}></img>
        {/* <DownOutlined className={styles.icon} /> */}
      </div>
    </Popover>
  );
};

const commonState = ({ Common }: ConnectState) => ({
  Common,
});

export default connect(commonState)(LanguageSelect);

// export default connect(({ Common }: ConnectState) => ({
//   Common,
// }))(LanguageSelect);
