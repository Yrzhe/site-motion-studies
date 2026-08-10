import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/* 构建产物是一个自包含的 HTML —— 打开即看，不需要服务器、不需要装依赖。
   这是本仓库对 demo 的一贯要求：单文件、无运行时依赖。 */
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { outDir: 'demo', emptyOutDir: true, assetsInlineLimit: 100_000_000 }
});
