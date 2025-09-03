// src/pages/admin.jsx
import { useEffect, useState } from 'react'
import { api } from '../api.js'
import RoleRoute from '../components/RoleRoute.jsx'

export default function AdminPage(){
  return (
    <RoleRoute allow={['admin']}>
      <AdminDashboard />
    </RoleRoute>
  )
}

function AdminDashboard(){
  const [biz, setBiz] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(()=>{
    (async ()=>{
      try {
        const [b, u] = await Promise.all([api.adminListBusinesses(), api.adminListUsers()])
        setBiz(b.items || [])
        setUsers(u.items || [])
      } catch(e){
        setErr(e.message || 'Error cargando admin')
      } finally {
        setLoading(false)
      }
    })()
  },[])

  if (loading) return <div className="p-4">Cargando…</div>
  if (err) return <div className="alert alert-danger m-4">{err}</div>

  return (
    <div className="container py-3">
      <h3 className="mb-3">Panel Admin</h3>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card p-3">
            <h5 className="mb-2">Páginas creadas</h5>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead><tr><th>Nombre</th><th>Slug</th><th>Categoría</th><th>Estado</th></tr></thead>
                <tbody>
                  {biz.map(b=>(
                    <tr key={b.id || b._id}>
                      <td>{b.name}</td>
                      <td>{b.slug}</td>
                      <td>{b.category || '-'}</td>
                      <td><span className="badge text-bg-success">{b.status || 'active'}</span></td>
                    </tr>
                  ))}
                  {biz.length===0 && <tr><td colSpan={4} className="text-muted">Sin negocios aún</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card p-3">
            <h5 className="mb-2">Usuarios</h5>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th></tr></thead>
                <tbody>
                  {users.map(u=>(
                    <tr key={u.id || u._id}>
                      <td>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td><span className="badge text-bg-secondary">{u.role}</span></td>
                    </tr>
                  ))}
                  {users.length===0 && <tr><td colSpan={3} className="text-muted">Sin usuarios aún</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
