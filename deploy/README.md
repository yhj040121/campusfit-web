# 青搭 Web 同源部署

这套配置按正式同源方案部署：

- 前端站点：`https://yuhaojie.cn`
- 后端接口：`https://yuhaojie.cn/api`
- Nginx 将 `/api` 反向代理到本机 Spring Boot `127.0.0.1:8080`

同源部署下，浏览器对 `POST /api/...` 仍可能携带 `Origin: https://yuhaojie.cn`。
如果云上 Spring Boot 的 CORS 白名单还没同步到根域名，Nginx 里的 `/api/` 反代需要加：

```nginx
proxy_set_header Origin "";
```

这样可以避免同源请求被后端误判为跨域拦截。

## 1. 构建前端

```bash
cd /path/to/web
npm install
npm run build
```

## 2. 上传前端产物

把 `dist` 目录内容上传到：

```bash
/var/www/yuhaojie.cn
```

## 3. 配置 Nginx

复制 [nginx.yuhaojie.cn.conf](./nginx.yuhaojie.cn.conf) 到服务器，例如：

```bash
sudo cp nginx.yuhaojie.cn.conf /etc/nginx/conf.d/yuhaojie.cn.conf
```

然后检查并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

建议把默认站点也禁用，避免无关配置抢请求：

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 4. 启动后端

确保 Spring Boot 运行在：

```bash
http://127.0.0.1:8080
```

## 5. 验证

访问：

```bash
https://yuhaojie.cn
```

接口验证：

```bash
curl -i https://yuhaojie.cn/api/auth/send-code
```

如果你看到 `Request method 'GET' is not supported`，说明反向代理已经到达后端。

## 6. 上线后自检

```bash
curl -I https://yuhaojie.cn
curl -I https://www.yuhaojie.cn
curl -i https://yuhaojie.cn/api/auth/send-code
```

预期结果：

- `https://yuhaojie.cn` 返回 `200`
- `https://www.yuhaojie.cn` 跳转到 `https://yuhaojie.cn`
- `https://yuhaojie.cn/api/...` 能到达 Spring Boot
