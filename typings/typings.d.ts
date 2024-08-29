declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module 'rc-util*';
declare module '*.xlsx';
declare module '*.svg' {
  export function ReactComponent(props: React.SVGProps<SVGSVGElement>): React.ReactElement;
  const url: string;
  export default url;
}

interface Window {
  [key: string]: any;
  _gr_ignore_local_rule: boolean;
}

declare module 'gt3-sdk';

declare module 'qs';

declare module 'marked';
