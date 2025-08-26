import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Si publicas en GitHub Pages con un repo llamado "misitiofacil-frontend",
// cambia base: '/misitiofacil-frontend/'
export default defineConfig({
  plugins: [react()],
  base: '/'
})
