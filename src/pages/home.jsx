// src/pages/home.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import PublishButton from '../components/PublishButton.jsx'
import { buildPublicUrl } from '../utils/host'

function Hero() {
  return (
    <div className="card border-0 mb-4" style={{
      background:
        'radial-gradient(1200px 400px at 10% -20%, rgba(99,102,241,.25), transparent), ' +
        'radial-gradient(1200px 400px at 110% 120%, rgba(14,165,233,.25), transparent)',
      overflow: 'hidden'
    }}>
      <div className="p-4 p-md-5 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h1 className="mb-2">Tus páginas <span className="brand-gradient">listas para publicar</span></h1>
          <p className="text-muted m-0">Crea, edita y publica tu página en un subdominio en minutos.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-brand" to="/create"><i className="bi bi-magic me-1" /> Crear página</Link>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [me, setMe] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true); setMsg('')
    try {
      const { user } = await api.me()
      setMe(user || null)

      // Owner: solo sus negocios | Admin: todos
      const data = user?.role === 'admin'
        ? (await api.listAllBusinesses())
        : (await api.listMyBusinesses())

      // Admite ambas formas: {items:[]} o {data:{businesses:[]}}
      const list =
        (Array.isArray(data?.items) && data.items) ||
        (Array.isArray(data?.data?.businesses) && data.data.businesses) ||
        (Array.isArray(data) && data) ||
        []

      setItems(list)
    } catch (e) {
      setMsg(e?.message || 'No se pudo cargar la lista')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onDelete(id) {
    if (!confirm('¿Eliminar este negocio?')) return
    try {
      await api.deleteBusiness(id)
      await load()
    } catch (e) {
      alert(e?.message || 'No se pudo eliminar')
    }
  }

  async function onToggle(id, enabled) {
    try {
      await api.setBusinessStatus(id, !enabled)
      await load()
    } catch (e) {
      alert(e?.message || 'No se pudo cambiar el estado')
    }
  }

  return (
    <div className="container-xxl">
      <Hero />

      {msg && <div className="alert alert-danger">{msg}</div>}

      <div className="card">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <strong>{me?.role === 'admin' ? 'Todos los negocios' : 'Mis negocios'}</strong>
          <Link className="btn btn-sm btn-brand" to="/create"><i className="bi bi-plus" /> Crear página</Link>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle m-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Estado</th>
                <th>Plantilla</th>
                <th style={{ width: 360 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="p-4 text-muted">Cargando…</td></tr>
              )}

              {!loading && items.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-muted">No hay negocios todavía.</td></tr>
              )}

              {items.map(b => {
                const id = b._id || b.id
                const slug = b.slug
                const isEnabled = b.enabled !== false && b.status !== 'SUSPENDED' && b.status !== 'INACTIVE'
                const publicUrl = slug ? buildPublicUrl(slug) : '#'

                return (
                  <tr key={id}>
                    <td>{b.name}</td>
                    <td><code>{slug}</code></td>
                    <td>
                      {isEnabled
                        ? <span className="badge bg-success">Activo</span>
                        : <span className="badge bg-secondary">Desactivado</span>}
                    </td>
                    <td><code>{b.templateKey || b.templateId || '-'}</code></td>
                    <td className="d-flex flex-wrap gap-2">
                      {/* Publicar (usa el PublishButton que ya tienes) */}
                      {slug && <PublishButton slug={slug} openAfter className="btn btn-brand btn-sm" />}

                      {/* Ver pública (abre subdominio si existe) */}
                      {slug && (
                        <a className="btn btn-soft btn-sm" href={publicUrl} target="_blank" rel="noopener noreferrer">
                          Ver pública
                        </a>
                      )}

                      {/* Editar */}
                      <Link className="btn btn-soft btn-sm" to={`/create?id=${id}`}>Editar</Link>

                      {/* Eliminar */}
                      <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(id)}>
                        Eliminar
                      </button>

                      {/* Activar / Desactivar solo para ADMIN */}
                      {me?.role === 'admin' && (
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => onToggle(id, isEnabled)}
                          title={isEnabled ? 'Desactivar' : 'Activar'}
                        >
                          {isEnabled ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-muted small mt-4">
        © {new Date().getFullYear()} MiSitioFácil — Hecho con <span className="text-danger">❤</span>
      </div>
    </div>
  )
}
