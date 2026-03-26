# 青搭 Web

青搭 Web 是青搭 V1 的 Web 端前台项目，基于 Vue 3 和 Vite 构建，面向内容浏览、活动发现、内容发布和个人中心等核心场景。

## 当前版本

- 版本标识：`青搭 V1`
- 技术栈：`Vue 3`、`Vue Router`、`Vite`、`Axios`

## 功能范围

- 首页内容流与搜索
- 活动中心与活动详情
- 内容详情浏览
- 登录 / 注册弹窗
- 内容发布
- 个人中心

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址：

- `http://127.0.0.1:5174`

## 构建与预览

```bash
npm run build
npm run preview
```

## 环境变量

- `.env.development`
  - `VITE_API_PROXY_TARGET=https://api.yuhaojie.cn`
- `.env.production`
  - `VITE_API_BASE_URL=/api`

## 部署说明

- Nginx 配置和部署说明位于 [`deploy/`](./deploy)

## 目录结构

```text
web
├─ deploy
├─ src
│  ├─ api
│  ├─ components
│  ├─ layouts
│  ├─ router
│  ├─ stores
│  ├─ utils
│  └─ views
├─ index.html
├─ package.json
└─ vite.config.js
```
