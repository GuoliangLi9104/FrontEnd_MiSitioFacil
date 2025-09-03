// src/pages/preview.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

function PreviewCanvas({ slug }) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let alive = true
    ;(async () => {
      try { const res = await api.getPublicSite(slug); if (alive){ setData(res); setErr('') } }
      catch (e) { if (alive){ setErr(e?.message || 'No se pudo cargar'); setData(null) } }
      finally { if (alive) setLoading(false) }
    })()
    return () => { alive = false; setLoading(true) }
  }, [slug])

  if (!slug) return <div className="text-muted p-3">Selecciona un sitio para previsualizar.</div>
  if (loading) return <div className="p-3 placeholder-glow"><div className="placeholder col-8" /><div className="placeholder col-10 mt-2" /><div className="placeholder col-6 mt-2" /></div>
  if (err) return <div className="p-3 alert alert-danger">{err}</div>
  if (!data) return null

  const { business, services } = data
  const priceFmt = (n)=> new Intl.NumberFormat('es-CR',{ style:'currency', currency:'CRC', maximumFractionDigits:0 }).format(Number(n||0))

  return (
    <div className="p-3">
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <div>
          <h3 className="m-0">{business?.name}</h3>
          {business?.category && <div className="text-muted small">{business.category}</div>}
        </div>
        <button className="btn btn-brand btn-sm" onClick={async ()=>{
          const r = await api.publishFromLocal(slug)
          alert(r?.source === 'local' ? 'Guardado localmente (sin backend).' : 'Publicado en backend.')
        }}>Publicar página</button>
      </div>

      <div className="card p-3 mb-3">
        <strong>Descripción</strong>
        <div className="text-muted">{business?.description || '—'}</div>
      </div>

      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <strong>Servicios</strong>
          <span className="small text-muted">{services?.length || 0} disponibles</span>
        </div>
        {(!services || services.length === 0) ? (
          <div className="text-muted">Aún no hay servicios.</div>
        ) : (
          <div className="row g-3">
            {services.map(s => (
              <div key={s.serviceId} className="col-12 col-md-6 col-lg-4">
                <div className="card p-3 h-100">
                  <div className="d-flex justify-content-between">
                    <strong>{s.title}</strong>
                    <span className="badge text-bg-dark">{s.durationMin} min</span>
                  </div>
                  {s.description && <div className="small text-muted mt-1">{s.description}</div>}
                  <div className="mt-auto fw-semibold">{priceFmt(s.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PreviewPage() {
  const [sites, setSites] = useState([])
  const [slug, setSlug] = useState('')

  useEffect(() => {
    setSites(api.listLocalSites())
  }, [])

  const selected = useMemo(() => sites.find(s => s.slug === slug), [sites, slug])

  return (
    <div className="container-xxl">
      <div className="card p-4 mb-3" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,.1), rgba(139,92,246,.1))' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h2 className="m-0">Vista previa</h2>
            <div className="text-muted">Render en vivo del sitio guardado en tu navegador (sin backend).</div>
          </div>
          <div className="d-flex gap-2">
            <Link className="btn btn-soft" to="/builder"><i className="bi bi-sliders me-1" /> Ir al constructor</Link>
            {selected && <Link className="btn btn-brand" to={`/site/${selected.slug}`}><i className="bi bi-box-arrow-up-right me-1" /> Ver pública</Link>}
          </div>
        </div>
      </div>

      <div className="card p-3 mb-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Selecciona un sitio</label>
            <select className="form-select" value={slug} onChange={e => setSlug(e.target.value)}>
              <option value="">—</option>
              {sites.map(s => <option key={s.key} value={s.slug}>{s.name} — {s.slug}</option>)}
            </select>
          </div>
          <div className="col-md-6 text-md-end text-muted small">
            {selected ? <>Slug: <code>{selected.slug}</code> — Categoría: {selected.category || '—'}</> : '—'}
          </div>
        </div>
      </div>

      <div className="card p-0">
        <PreviewCanvas slug={slug} />
      </div>
    </div>
  )
}
