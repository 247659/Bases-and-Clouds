import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // Przekierowanie żądań API do zewnętrznego serwera, np. API Gateway
      '/test2': {
        target: 'https://tnvswpmu22.execute-api.eu-north-1.amazonaws.com/Stage1',
        changeOrigin: true, // Zmiana nagłówka 'Origin' na ten z docelowego serwera
        rewrite: (path) => path.replace(/^\/test2/, ''), // Opcjonalnie usunięcie prefixu /test2
      },
    },
  },
})
