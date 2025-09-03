// src/app.jsx
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import Footer from './components/footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/home.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import Builder from './pages/builder.jsx'
import Preview from './pages/preview.jsx'
import PublicSite from './pages/publicsite.jsx'
import Booking from './pages/booking.jsx'
import TemplateSelector from './pages/TemplateSelector.jsx'
import SchedulePage from './pages/schedule.jsx'

import AdminPage from './pages/admin.jsx'
import CreatePage from './pages/create.jsx'
import OwnerPage from './pages/owner.jsx'

// NUEVO
import TenantRouter from './pages/TenantRouter.jsx'

// Estado backend
import { api, BACKEND_CONFIGURED } from './api'

export default function App() {
  const [backendStatus, setBackendStatus] = useState({ checked:false, ok:false, msg:'' })

  useEffect(() => {
    let mounted = true
    async function check() {
      if (!BACKEND_CONFIGURED) {
        mounted && setBackendStatus({ checked:true, ok:false, msg:'Backend no configurado' })
        return
      }
      const r = await api.ping()
      if (!mounted) return
      if (r.ok && r.backend) setBackendStatus({ checked:true, ok:true, msg:'Conectado al backend' })
      else setBackendStatus({ checked:true, ok:false, msg: r.message || 'Sin conexión al backend' })
    }
    check()
    return () => { mounted = false }
  }, [])

  return (
    <>
      <Navbar />
      {/* Mapea subdominio → /site/:slug */}
      <TenantRouter />

      {/* Banner de estado del backend */}
      {backendStatus.checked && (
        <div className="container">
          <div
            className={`my-2 rounded px-3 py-2 text-sm ${backendStatus.ok
              ? 'bg-green-100 border border-green-300 text-green-800'
              : 'bg-red-100 border border-red-300 text-red-800'
            }`}
            role="status"
            aria-live="polite"
          >
            {backendStatus.ok ? '✅ ' : '⚠️ '}{backendStatus.msg}
          </div>
        </div>
      )}

      <main className="py-4">
        <div className="container">
          <Routes>
            {/* público */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/site/:slug" element={<PublicSite />} />
            <Route path="/site/:slug/booking" element={<Booking />} />

            {/* demo/admin/owner */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/owner" element={<OwnerPage />} />

            {/* privado */}
            <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/preview" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><TemplateSelector /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<h4>404 - No encontrado</h4>} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  )
}
