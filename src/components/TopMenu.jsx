// src/components/TopMenu.jsx
import { Link, useNavigate } from 'react-router-dom'
import { getAuthInfo, devLoginAs, logoutDev } from '../utils/auth'
import { useEffect, useState } from 'react'

export default function TopMenu(){
  const nav = useNavigate()
  const [info, setInfo] = useState(getAuthInfo())

  useEffect(()=>{
    const onStorage = () => setInfo(getAuthInfo())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  },[])

  const setRole = (r) => {
    devLoginAs(r)
    setInfo(getAuthInfo())
    nav(0)
  }

  return (
    <div className="container py-2 d-flex align-items-center justify-content-between">
      <div className="d-flex gap-3">
        <Link to="/" className="text-decoration-none">Inicio</Link>
        <Link to="/site/demo" className="text-decoration-none">Demo Pública</Link>
        <Link to="/create" className="text-decoration-none">Crear Página</Link>
        <Link to="/owner" className="text-decoration-none">Mi Página</Link>
        <Link to="/admin" className="text-decoration-none">Admin</Link>
      </div>
      <div className="d-flex align-items-center gap-2">
        <span className="badge text-bg-secondary">{info.role}</span>
        <div className="dropdown">
          <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Rol</button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><button className="dropdown-item" onClick={()=>setRole('client')}>Client</button></li>
            <li><button className="dropdown-item" onClick={()=>setRole('owner')}>Owner</button></li>
            <li><button className="dropdown-item" onClick={()=>setRole('admin')}>Admin</button></li>
          </ul>
        </div>
        <button className="btn btn-sm btn-outline-danger" onClick={()=>{ logoutDev(); nav(0) }}>Salir</button>
      </div>
    </div>
  )
}
