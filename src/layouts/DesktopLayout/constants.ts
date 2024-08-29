/* eslint-disable @typescript-eslint/no-unused-vars */
import api from '@/assets/icon/api-file.svg';
import help from '@/assets/icon/help-center.svg';
import { textinDomain } from '@/utils/helper';

export interface IDesktopMenu {
  name: string;
  icon?: string;
  iconOff?: string;
  path?: string;
  children?: IDesktopMenu[];
  active?: boolean;
  collapsed?: boolean;
  subMenu?: IDesktopMenu[];
  activeArr?: string[];
  key?: string;
  logKey?: string;
  target?: '_blank' | '_parent' | '_self' | '_top';
}

const desktopHrefMenu: IDesktopMenu[] = [
  {
    name: 'API文档',
    icon: api,
    path: textinDomain + '/document/index',
    key: 'href-0',
    logKey: 'api_document',
  },
  {
    name: '帮助中心',
    icon: help,
    path: textinDomain + '/doc/guide/first',
    key: 'href-1',
    logKey: 'help_center',
  },
];

export { desktopHrefMenu };
