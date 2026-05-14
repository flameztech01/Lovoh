import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        biizzed: resolve(__dirname, 'biizzed.html'),
        uduua: resolve(__dirname, 'uduua.html'),
        eventroom: resolve(__dirname, 'eventroom.html'),
      },
    },
  },
  server: {
    host: true,
    port: 9000,
    allowedHosts: ['entrepreneurs-morgan-alliance-rarely.trycloudflare.com'],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
});