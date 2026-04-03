// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import viteImagemin from 'vite-plugin-imagemin';
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      // حل مشكلة ReferenceError: process is not defined
      'process.env': env,
      'process.platform': JSON.stringify('win32'),
      'global': 'window', // حل لبعض المكتبات القديمة
    },
    envPrefix: 'VITE_',
    plugins: [
      // ✅ الترتيب الصحيح: Vue أولاً ثم Vuetify
      vue(), 
      vuetify({ 
        autoImport: true 
      }),
      vueI18n({
        include: path.resolve(__dirname, './src/locales/**'),
      }),
      viteImagemin({
        gifsicle: { interlaced: true },
        optipng: { optimizationLevel: 5 },
        mozjpeg: { quality: 80 },
        pngquant: { quality: [0.8, 0.9], speed: 4 },
        svgo: {
          plugins: [
            { name: 'removeViewBox' },
            { name: 'removeEmptyAttrs', active: false },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      // Handle Apollo Client React peer dependency
      dedupe: ['@apollo/client'],
    },
    server: {
      port: 8080, // Use port 8080
      host: true, // Allow external connections
      hmr: {
        port: 8080, // Use same port as server
        host: 'localhost' // Explicit host for HMR
      },
      proxy: {
        '/graphql': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
          ws: true // Enable WebSocket proxy
        },
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          ws: true // Enable WebSocket proxy
        }
      }
    },
    optimizeDeps: {
      include: [
        'vue',
        '@apollo/client',
        'graphql',
        'graphql-tag'
      ],
      exclude: [
        '@apollo/client/react',
        'subscriptions-transport-ws'
      ],
      force: true
    },
    build: {
      chunkSizeWarningLimit: 1600,
      minify: 'terser',
      sourcemap: process.env.NODE_ENV === 'development',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const module = id.toString().split('node_modules/')[1].split('/')[0].toString();
              
              // Group vendor modules
              if (module.includes('vue')) return 'vue-vendor';
              if (module.includes('vuetify')) return 'vuetify-vendor';
              if (module.includes('chart')) return 'chart-vendor';
              if (module.includes('apollo') || module.includes('graphql')) return 'graphql-vendor';
              if (module.includes('prime')) return 'prime-vendor';
              if (module.includes('@mdi') || module.includes('fontawesome')) return 'icon-vendor';
              
              return 'vendor';
            }
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production',
        },
      },
    },
  };
});
