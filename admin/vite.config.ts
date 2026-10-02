import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3011';

  return {
  plugins: [react()],
  // Absolute base so deep links like /bill/:token load /assets/* correctly (not /bill/assets/*).
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
};
});
