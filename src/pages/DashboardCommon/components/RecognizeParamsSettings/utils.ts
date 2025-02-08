import { textinDomain } from '@/utils/helper';

export const SettingsSaveKey = 'recognition-params-settings';

export const getParamsSettings = () => {
  const settings = window.sessionStorage.getItem(SettingsSaveKey);
  if (settings) {
    try {
      const curSettings = JSON.parse(settings);
      if (curSettings && typeof curSettings === 'object') {
        return curSettings;
      }
    } catch (error) {
      console.log('parse error', error, settings);
    }
  }
  return null;
};

export const serviceListNeedParamsSetting = ['pdf_to_markdown'];

export const bannerTipsDict: Record<string, string> = {
  pdf_to_markdown: '配置解析页数、输出内容等参数，处理更高效，结果更精准！',
};
export const getParamsSettingBannerTips = (service: string) => {
  return bannerTipsDict[service] || '';
};

// 通用文档解析
const mdDefaultParams: Record<string, any> = {
  custom_api: window._env_host?.API_URL || 'https://api.textin.com/ai/service/v1/pdf_to_markdown',
  dpi: 144,
  page_count: 1000,
  apply_document_tree: 1,
  markdown_details: 1,
  table_flavor: 'html',
  get_image: 'objects',
  parse_mode: 'scan',
  page_details: 1,
  catalog_details: 1,
  get_excel: 1,
};

const mdParamsZH: Record<string, any> = {
  pdf_pwd: 'PDF密码',
  dpi: '文件分辨率',
  page_start: '解析起点页码',
  page_count: '解析的页数',
  apply_document_tree: '识别文档标题',
  markdown_details: '获取JSON结果',
  table_flavor: '表格语法',
  get_image: '获取页面图片',
  parse_mode: '解析模式',
  page_details: '获取页面元素',
  char_details: '获取文本行详情',
  catalog_details: '目录',
  image_output_type: '图片类型',
  get_excel: '获取Excel文件',
  raw_ocr: '全文识别结果',
  remove_watermark: '去水印',
  crop_enhance: '切边增强',
};

const mdRewriteParamsType: Record<string, any> = {
  page_details: 'switch',
  char_details: 'switch',
  catalog_details: 'switch',
};

const mdParamsProps: Record<string, any> = {
  page_start: { min: 1, max: 1000 },
  page_count: { min: 1, max: 1000 },
};

const mdParamsSort = [
  'page_start',
  'page_count',
  'dpi',
  'pdf_pwd',
  'apply_document_tree',
  'markdown_details',
  'catalog_details',
  'page_details',
  'char_details',
  'crop_enhance',
  'remove_watermark',
  'apply_chart',
  'table_flavor',
  'get_image',
  'image_output_type',
  'parse_mode',
];

export const AppIdAndSecretPosition = `请在【参数配置】中填写`;

export const AppIdAndSecretDesc = `请至 ${textinDomain} 免费注册账号后，在【<a href="https://www.textin.com/console/dashboard/setting" target="_blank">工作台 - 账号管理 - 开发者信息</a>】中查看`;

export const AppIdAndSecretOptions = [
  {
    desc: `自定义API接口地址`,
    label: '接口地址',
    key: 'custom_api',
    require: false,
    type: 'string',
  },
  {
    desc: AppIdAndSecretDesc,
    key: 'x-ti-app-id',
    require: false,
    type: 'string',
  },
  {
    desc: AppIdAndSecretDesc,
    key: 'x-ti-secret-code',
    require: false,
    type: 'string',
  },
];

export const getDefaultParams = (robotInfo: any) => {
  if (robotInfo.interaction === 16) {
    return mdDefaultParams;
  }
  return {};
};

export const rewriteParams = (url_params: any[], { robotInfo }: { robotInfo: any }) => {
  let params = [...url_params];
  if (robotInfo.interaction === 16) {
    for (let index = 0; index < params.length; index++) {
      const row = params[index];
      if ('get_image' === row.key && mdDefaultParams[row.key]) {
        row.desc =
          '<p>获取markdown里的图片，默认为objects，返回页面内的图像对象</p>\n<ul>\n<li>none 不返回任何图像</li>\n<li>page 返回每一页的整页图像</li>\n<li>objects 返回页面内的图像对象</li>\n<li>both 返回整页图像和图像对象</li>\n</ul>\n';
      } else if ('parse_mode' === row.key && mdDefaultParams[row.key]) {
        row.desc =
          '<p>PDF解析模式，默认为scan模式，仅按文字识别模式。图片不用设置，均按文字识别方式处理。</p>\n<ul>\n<li>auto 综合文字识别和解析模式</li>\n<li>scan 仅按文字识别模式</li>\n</ul>\n';
      } else if ('dpi' === row.key) {
        row.valueEnums = [72, 144, 216].map((item) => ({ label: item, value: item, key: item }));
      } else if (row.key === 'get_excel') {
        row.desc =
          '<p>是否返回excel结果，结果字段为excel_base64，默认为1，返回</p>\n<ul>\n<li>0 不返回</li>\n<li>1 返回</li>\n</ul>\n';
      }
      if (mdParamsZH[row.key]) {
        row.label = mdParamsZH[row.key];
      }
      if (mdParamsProps[row.key]) {
        row.props = mdParamsProps[row.key];
      }
      if (mdRewriteParamsType[row.key]) {
        row.rewriteType = mdRewriteParamsType[row.key];
      }
      // 参数展示顺序
      const sortKey = mdParamsSort.indexOf(row.key);
      row.sortKey = sortKey > -1 ? sortKey * 20 : params[index - 1].sortKey || index;
    }
    params = params.sort((a, b) => a.sortKey - b.sortKey);

    params.unshift(
      ...(window._env_host?.PRIVATE ? AppIdAndSecretOptions.slice(0, 1) : AppIdAndSecretOptions),
    );
  }
  return params;
};
