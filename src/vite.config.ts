import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        bypass(req) {
          // Don't proxy requests for files with extensions (like .ts, .tsx, .js, etc.)
          if (req.url && /\.\w+$/.test(req.url.split('?')[0])) {
            return req.url;
          }
        },
      }
    }
  }
})