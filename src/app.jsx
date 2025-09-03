// src/app.jsx
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Navbar from './components/navbar.jsx'
import Footer from './components/footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/home.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import CreatePage from './pages/create.jsx'

// Estado backend
import { api, BACKEND_CONFIGURED } from './api.js'

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
      setBackendStatus(
        r.ok && r.backend
          ? { checked:true, ok:true, msg:'Conectado al backend' }
          : { checked:true, ok:false, msg: r.message || 'Sin conexión al backend' }
      )
    }
    check()
    return () => { mounted = false }
  }, [])

  return (
    <>
      <Navbar />

      {/* Banner de estado del backend */}
      {backendStatus.checked && (
        <div className="container">
          <div
            className={`my-2 rounded px-3 py-2 text-sm ${
              backendStatus.ok
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
            {/* Público */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Privado */}
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<h4>404 - No encontrado</h4>} />
          </Routes>
        </div>
      </main>

      <Footer />
    </>
  )
}
