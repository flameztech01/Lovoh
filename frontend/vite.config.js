import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'react-router-dom': path.resolve(__dirname, 'src/utils/subdomainRouter.js'),
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
})