// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'https://misitiofacil-backend.vercel.app',
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            try {
              proxyReq.removeHeader?.('origin')
              proxyReq.removeHeader?.('referer')
              proxyReq.removeHeader?.('sec-fetch-site')
              proxyReq.removeHeader?.('sec-fetch-mode')
              proxyReq.removeHeader?.('sec-fetch-dest')
            } catch (err) {
              console.warn('[ProxyReq Error]', err.message)
            }
          })
          proxy.on('error', (err, _req, _res) => {
            console.error('[Vite Proxy Error]:', err?.message || err)
          })
        }
      }
    }
  }
})
