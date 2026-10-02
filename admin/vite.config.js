import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig(function (_a) {
    var _b;
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var apiProxyTarget = ((_b = env.VITE_API_URL) === null || _b === void 0 ? void 0 : _b.replace(/\/$/, '')) || 'http://localhost:3011';
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
