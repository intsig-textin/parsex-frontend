import { defineConfig } from 'umi';
import theme from '../src/utils/theme';
import defaultSettings from './defaultSettings';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { prefixPath } from '../src/utils/env';
import path from 'path';
const { NODE_ENV } = process.env;

/**
 * base config file
 */
export default defineConfig({
  history: {
    type: 'browser',
  },
  define: {
    env: NODE_ENV,
  },
  hash: true,
  locale: false,
  base: prefixPath,
  publicPath: prefixPath,
  ignoreMomentLocale: true,
  theme: {
    'primary-color': defaultSettings.primaryColor,
    'primary-color-hover': '#1A66FF',
    'border-color-base': '#DCDFE5',
    'text-color': '#030A1A',
    'normal-icon-color': '#858C99',
    'normal-font-color': '#030A1A',
    ...theme,
  },
  antd: {},
  dva: {
    hmr: true,
  },
  targets: {
    // 浏览器兼容 Default: { chrome: 49, firefox: 64, safari: 10, edge: 13, ios: 10 }
    ie: 11,
    // firefox: 52,
  },
  dynamicImport: {
    loading: '@/pages/Loading',
  },
  dynamicImportSyntax: {},
  headScripts: [{ src: `${prefixPath}classList.polyfill.min.js`, defer: true }],
  externals: {
    // react: 'window.React',
    xlsx: 'XLSX',
  },

  scripts: [
    // 'https://static.textin.com/deps/react@17.0.2/react.production.min.js',
    'https://static.textin.com/deps/xlsx@0.17.4/dist/xlsx.full.min.js',
  ],
  copy: ['./vendor/classList.polyfill.min.js'],
  cssLoader: {
    modules: {
      localIdentName: '[local]--[hash:base64:5]',
      getLocalIdent: (
        context: {
          resourcePath: string;
        },
        _: string,
        localName: string,
      ) => {
        if (
          context.resourcePath.includes('node_modules') ||
          context.resourcePath.includes('ant.design.pro.less') ||
          context.resourcePath.includes('global.less')
        ) {
          return localName;
        }

        const match = context.resourcePath.match(/src(.*)/);

        if (match && match[1]) {
          return null;
        }

        return localName;
      },
    },
  },
  manifest: {
    basePath: prefixPath,
  },
  metas: [
    {
      name: 'keywords',
      content:
        'OCR，深度学习，AI，文字识别，图像识别，表格识别，身份证识别，发票识别，银行卡识别，营业执照识别，图像技术，在线免费识别',
    },
    {
      name: 'description',
      content:
        'TextIn 合合信息旗下智能文字识别品牌，专注智能文字识别15年，为扫描全能王、名片全能王提供OCR能力，是集智能文字识别技术、产品、服务于一身的一站式OCR服务平台，为全球数千家企业及上亿用户提供服务。',
    },
  ],
  alias: {
    '@root': '/',
  },
  //["module-resolver", { root:["./"] ,"alias": { "@": path.resolve(__dirname,"../src") } }],
  // extraBabelPlugins:[['inline-react-svg',{}],["module-resolver", { root:["../"] ,"alias": { "@": "./src" } }]],
  extraBabelIncludes: [path.join(__dirname, './node_modules/exif-rotate-js/lib')],
  chunks: ['vendors', 'umi'],
  chainWebpack(config) {
    config.merge({
      optimization: {
        splitChunks: {
          cacheGroups: {
            commons: {
              test: /(react|react-dom)/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      },
    });
    // config.resolve.alias.set('monaco-editor', 'monaco-editor/esm/vs/editor/editor.api.js')
    config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
      {
        languages: [
          'javascript',
          'python',
          'html',
          'java',
          'lua',
          'php',
          'cpp',
          'csharp',
          'shell',
          'go',
        ],
      },
    ]);
    config.module
      .rule('xlsx')
      .test(/\.(xlsx)$/)
      .use('file-loader')
      .loader('file-loader')
      .end();
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
});
