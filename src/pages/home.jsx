// src/pages/home.jsx  (añade demo: seed + login rápido)
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { getAuthInfo, devLoginAs } from '../utils/auth'
import { seedDemo } from '../utils/seed'

export default function Home(){
  const [biz, setBiz] = useState([])
  const [info, setInfo] = useState(getAuthInfo())
  const [seeded, setSeeded] = useState(false)

  useEffect(()=>{
    (async ()=>{
      const data = await api.adminListBusinesses()
      const items = data.items || []
      if (items.length === 0 && !seeded) {
        seedDemo({ makeAdmin:false })
        const data2 = await api.adminListBusinesses()
        setBiz(data2.items || [])
        setSeeded(true)
      } else {
        setBiz(items)
      }
    })()
  },[seeded])

  const loginAs = (role) => {
    if (role === 'admin') seedDemo({ makeAdmin:true })
    if (role === 'owner') seedDemo({ makeAdmin:false })
    if (role === 'client') devLoginAs('client', {})
    setInfo(getAuthInfo())
    window.location.reload()
  }

  const demo = biz.find(b => b.slug === 'demo-barber')
  return (
    <div className="container py-3">
      <h3 className="mb-3">Inicio</h3>

      <div className="alert alert-secondary">
        <strong>Modo Demo:</strong> Crea y prueba datos reales en localStorage.
        <div className="mt-2 d-flex gap-2">
          <button className="btn btn-sm btn-outline-dark" onClick={()=>loginAs('client')}>Entrar como Cliente</button>
          <button className="btn btn-sm btn-outline-primary" onClick={()=>loginAs('owner')}>Entrar como Owner (demo)</button>
          <button className="btn btn-sm btn-outline-warning" onClick={()=>loginAs('admin')}>Entrar como Admin (demo)</button>
        </div>
        <div className="mt-2">
          {demo && (
            <>
              <span className="me-2">Página demo: </span>
              <Link to={`/site/${demo.slug}`} className="btn btn-sm btn-link">/site/{demo.slug}</Link>
              <Link to="/owner" className="btn btn-sm btn-link">Mi Página (owner)</Link>
              <Link to="/admin" className="btn btn-sm btn-link">Admin</Link>
            </>
          )}
        </div>
      </div>

      <div className="card p-3">
        <h5 className="mb-2">Páginas existentes</h5>
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead><tr><th>Nombre</th><th>Slug</th><th>Categoría</th><th>Link</th></tr></thead>
            <tbody>
              {biz.map(b=>(
                <tr key={b.id || b._id}>
                  <td>{b.name}</td>
                  <td>{b.slug}</td>
                  <td>{b.category || '-'}</td>
                  <td><Link to={`/site/${b.slug}`}>Ver pública</Link></td>
                </tr>
              ))}
              {biz.length===0 && <tr><td colSpan={4} className="text-muted">Sin páginas todavía</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
