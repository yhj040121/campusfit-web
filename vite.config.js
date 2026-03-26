import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET || "https://api.yuhaojie.cn";

  const apiProxy = {
    "/api": {
      target: proxyTarget,
      changeOrigin: true,
      secure: true
    }
  };

  return {
    plugins: [vue()],
    server: {
      host: "0.0.0.0",
      port: 5174,
      strictPort: true,
      proxy: apiProxy
    },
    preview: {
      host: "0.0.0.0",
      port: 4174,
      strictPort: true,
      proxy: apiProxy
    }
  };
});
