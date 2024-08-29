import './utils/h5';
import React from 'react';
// import { createLogger } from 'redux-logger';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import { message } from 'antd';
import qs from 'query-string';
import { history } from 'umi';

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-underscore-dangle
  window._gr_ignore_local_rule = true;
}

export const dva = {
  config: {
    // onAction: createLogger(),
    onError(e: Error) {
      if (e.message) {
        message.destroy();
        message.error(e.message, 1);
      }
    },
  },
};

export function rootContainer(container: React.ReactNode) {
  return React.createElement(ConfigProvider, { locale: zhCN }, container);
}

const checkUser = () => {
  const { pathname, search = '' } = window.location;
  if (search.includes('_token')) {
    const { _token } = qs.parse(search);
    if (_token && typeof _token === 'string') {
      const newSearch = qs.pick(search, (key) => !['_token'].includes(key));
      history.replace(history.location.pathname + newSearch);
    }
  }
};

export function onRouteChange({ matchedRoutes }: { matchedRoutes: any }) {
  // 禁止右键
  document.oncontextmenu = (e) => {
    // return false;
  };
  checkUser();

  if (matchedRoutes.length) {
    document.title = `TextIn - ${matchedRoutes[matchedRoutes.length - 1].route.name || ''}`;
    window.scrollTo(0, 0);
  }
}
