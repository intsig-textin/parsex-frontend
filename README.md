
# [Parsex-Frontend](https://github.com/intsig-textin/parsex-frontend.git)

- [Parsex-Frontend](#parsex-frontend)
  - [项目简介](#项目简介)
  - [安装依赖](#安装依赖)
  - [启动项目](#启动项目)
  - [QA](#qa)
  - [脚本命令](#脚本命令)
  - [项目结构](#项目结构)
  - [贡献](#贡献)
  - [许可证](#许可证)

## 项目简介

在解析结果审核校对、效果测评等场景，需要可视化展示文档解析后的结果。

在 [TextIn.com](https://textin.com) 体验页上，我们提供丰富的可视化和交互功能，这部分前端组件现已开源！

项目用ES6开发，基于React框架。[仓库地址](https://github.com/intsig/parse-genius-frontend)

目前前端组件已实现以下特性：

1. **预览渲染主流图片格式和pdf文件**，提供缩放和旋转功能
2. **markdown结果渲染**，支持各级标题、图片、公式渲染展示
3. **各类解析元素提取展示**，支持查看表格、公式、图片，和原始 JSON 结果
4. **解析元素文档位置溯源**，原文画框标注各元素位置，可以点击画框跳转解析结果，也可以点击解析结果跳转原文画框
5. **各级目录树还原展示**，支持点击跳转相应章节
6. **接口调用选项参数配置**，支持配置不同参数组合，获取相应解析结果
7. **复制和导出markdown文件**
8. **复制解析后的表格和图片**，可以直接粘贴到Excel表格中

以上功能，都可以在 [TextIn.com](https://textin.com) 上体验使用，[👉 体验地址](https://www.textin.com/console/recognition/robot_markdown?service=pdf_to_markdownm)

## 安装依赖

使用 npm 或 yarn 安装：

```bash
npm install
# 或
yarn install
```

## 启动项目

```bash
npm run start
# 或
yarn start
```

浏览器访问 <http://localhost:10007>

## QA

1. 如何获取`x-ti-app-id`, `x-ti-secret-code`

请至 [Textin.com](https://textin.com) 免费注册账号后，在【工作台 - 账号管理 - 开发者信息】中查看

## 脚本命令

在此列出常用的 `npm/yarn` 脚本命令，例如：

- `npm start` 或 `yarn start`：启动开发服务器。
- `npm run build` 或 `yarn build`：打包项目。
- `npm run lint` 或 `yarn lint`：检查代码风格。

全部`scripts`详细参考 `package.json` - `scripts`

## 项目结构

简要描述项目文件结构，以帮助贡献者和用户理解项目的组织方式。

```parse-genius-frontend
├── src/                    # 源代码
│   ├── assets/             # 静态资源
│   ├── components/         # 全局通用组件
│   ├── layouts/            # 页面框架组件
│   ├── modules/            # store
│   ├── pages/              # 页面组件
│   ├── service/            # 接口服务
│   ├── utils/              # 工具函数
│   └── app.ts              # 入口文件
├── public/                 # 静态资源
├── config/                 # 配置
│   ├── routes              # 路由
│   └── config.*            # 其他umi配置
├── .eslintrc.js            # ESLint 配置
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目配置
└── README.md               # 项目说明文件
```

## 贡献

欢迎贡献代码！在开始之前，请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 以了解贡献流程和指南。

## 许可证

此项目基于 [MIT License](LICENSE) 进行许可。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
