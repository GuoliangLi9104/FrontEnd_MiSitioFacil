// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  // Lee variables del sistema y de .env.* (Vite)
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_PROXY_TARGET || 'http://localhost:3001'

  return defineConfig({
    plugins: [react()],
    base: '/',
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: target.startsWith('https'),
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
            proxy.on('error', (err) => {
              console.error('[Vite Proxy Error]:', err?.message || err)
            })
          }
        }
      }
    }
  })
}
