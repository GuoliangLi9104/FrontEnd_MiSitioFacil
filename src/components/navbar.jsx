// src/components/navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAuthInfo, setAuthInfo } from '../utils/auth'

export default function Navbar() {
  const [user, setUser] = useState(getAuthInfo()?.user || null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setUser(getAuthInfo()?.user || null)
  }, [location.pathname])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'msf_auth') setUser(getAuthInfo()?.user || null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const logout = () => {
    try { setAuthInfo(null, null) } catch {}
    try { localStorage.removeItem('msf_auth') } catch {}
    navigate('/login', { replace: true }) // ⬅️ envía a Login
  }

  const label = user?.email || user?.fullName || user?.name || ''

  return (
    <nav className="navbar navbar-dark bg-dark border-bottom border-secondary">
      <div className="container d-flex align-items-center justify-content-between">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <i className="bi bi-stars" />
          <span className="brand-gradient fw-semibold">MiSitioFácil</span>
        </Link>

        <ul className="navbar-nav flex-row gap-3">
          <li className="nav-item">
            <Link className="nav-link text-light fw-semibold" to="/">Inicio</Link>
          </li>
        </ul>

        <div className="d-flex align-items-center gap-2">
          {user ? (
            <>
              <span className="text-muted small">{label}</span>
              <button className="btn btn-brand btn-sm" onClick={logout}>Salir</button>
            </>
          ) : (
            <>
              <Link className="btn btn-soft btn-sm" to="/login">Entrar</Link>
              <Link className="btn btn-brand btn-sm" to="/register">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
