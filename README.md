# MiSitioFácil — Frontend (React + Vite + Bootstrap)

## Requisitos
- Node.js 18+ y npm
- Backend corriendo y accesible por HTTP (define `VITE_API_BASE`)

## Instalación rápida
```bash
npm i
npm run dev
```
La app abre en `http://localhost:5173` (por defecto).

## Variables de entorno
Crea un archivo `.env` en la raíz (opcional si usas el placeholder):
```
VITE_API_BASE=https://tu-backend-render.onrender.com/api
```

## Build de producción
```bash
npm run build
npm run preview
```

## GitHub Pages
Si publicarás en un repo llamado `misitiofacil-frontend`, edita `vite.config.js`:
```js
export default defineConfig({
  plugins: [react()],
  base: '/misitiofacil-frontend/'
})
```
Luego:
```bash
npm run build
# sube la carpeta dist a Pages o usa gh-pages action
```

## Estructura
- `src/pages` (Login, Register, Builder, Preview, PublicSite, Booking)
- `src/components` (Navbar, TemplateCard, ServiceForm, ScheduleEditor)
- `src/api.js` (endpoints al backend)
- `public/index.html` (Bootstrap CDN)
