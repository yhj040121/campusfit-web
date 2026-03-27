# CampusFit Web

CampusFit Web 是基于 Vue 3、Vue Router、Vite 和 Axios 的前端项目。

## 本地开发

```bash
npm install
npm run dev:local
```

默认地址：
- `http://127.0.0.1:5174`

连接本地后端：
- `npm run dev:local`

连接服务器后端：
- `npm run dev:server`

## 构建与预览

```bash
npm run build:server
npm run preview:server
```

如果需要连本地后端预览：

```bash
npm run build:local
npm run preview:local
```

## 环境文件

- `.env.backend-local`
  - `VITE_API_BASE_URL=/api`
  - `VITE_API_PROXY_TARGET=http://127.0.0.1:8080`
- `.env.backend-server`
  - `VITE_API_BASE_URL=/api`
  - `VITE_API_PROXY_TARGET=https://yuhaojie.cn`
- `.env.production`
  - `VITE_API_BASE_URL=/api`

## 部署

- Nginx 配置和部署说明在 [`deploy/`](./deploy)
