// src/pages/publicsite.jsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api.js'
import PublishControl from '../components/PublishControl.jsx'

export default function PublicSite() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  const isSubdomain = useMemo(() => {
    const host = window.location.hostname.split(':')[0]
    return host !== 'localhost' && host.split('.').length >= 3 && !host.startsWith('www.')
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try { const res = await api.getPublicSite(slug); if (alive){ setData(res); setErr('') } }
      catch (e) { if (alive){ setErr(e?.message || 'No se pudo cargar el sitio'); setData(null) } }
      finally { if (alive) setLoading(false) }
    })()
    return () => { alive = false }
  }, [slug])

  useEffect(() => {
    document.title = data?.business?.name ? `${data.business.name} — MiSitioFácil` : 'MiSitioFácil'
  }, [data])

  if (loading) return (
    <div className="card p-4"><div className="placeholder-glow"><h2 className="placeholder col-6"></h2><p className="placeholder col-10"></p></div></div>
  )

  if (err) return (
    <div className="card p-4 d-flex justify-content-between align-items-center">
      <div className="alert alert-danger mb-0">{err}</div>
      <PublishControl slug={slug} />
    </div>
  )

  if (!data) return null

  const { business, services } = data
  const phoneDigits = (business?.phone || '').replace(/\D/g, '')
  const waText = encodeURIComponent(`Hola ${business?.name || ''}, me interesa reservar un servicio.`)
  const priceFmt = n => {
    try { return new Intl.NumberFormat('es-CR',{ style:'currency', currency:'CRC', maximumFractionDigits:0 }).format(Number(n||0)) }
    catch { return `₡${Number(n||0).toFixed(0)}` }
  }
  const bookingHref = isSubdomain ? '/booking' : `/site/${slug}/booking`

  return (
    <div className="row g-3">
      <div className="col-12 d-flex justify-content-end">
        {/* Nuevo control para publicar selección */}
        <PublishControl slug={slug} />
      </div>

      {/* Aquí tu layout existente… (hero, acciones, servicios, etc.) */}
      <div className="col-12">
        <div className="card p-0 overflow-hidden">
          <div
            style={{
              width: '100%', minHeight: 180,
              backgroundImage: business?.coverUrl
                ? `url("${business.coverUrl}")`
                : 'linear-gradient(135deg, rgba(99,102,241,.35), rgba(14,165,233,.35))',
              backgroundPosition: 'center', backgroundSize: 'cover'
            }}
          />
          <div className="p-4">
            <div className="d-flex align-items-center gap-3">
              <div
                style={{ width:64, height:64, borderRadius:16, display:'grid', placeItems:'center',
                         background:'rgba(255,255,255,.06)', border:'1px solid #2a3346', fontWeight:700, fontSize:22 }}
              >{(business?.name || '?').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase()}</div>
              <div className="flex-grow-1">
                <h2 className="m-0 brand-gradient">{business?.name}</h2>
                {business?.category && <div className="text-muted small mt-1">{business.category}</div>}
              </div>
            </div>

            {business?.description && <p className="text-muted mt-3 mb-3">{business.description}</p>}

            <div className="d-flex flex-wrap gap-2">
              {phoneDigits && (
                <a className="btn btn-success btn-sm" target="_blank" rel="noopener noreferrer"
                   href={`https://wa.me/${phoneDigits}?text=${waText}`}>
                  <i className="bi bi-whatsapp me-1" /> WhatsApp
                </a>
              )}
              <Link to={bookingHref} className="btn btn-brand btn-sm">
                <i className="bi bi-calendar-check me-1" /> Reservar
              </Link>
              {business?.website && <a className="btn btn-soft btn-sm" target="_blank" rel="noopener noreferrer" href={business.website}><i className="bi bi-globe me-1" /> Sitio web</a>}
              {business?.instagram && <a className="btn btn-soft btn-sm" target="_blank" rel="noopener noreferrer" href={business.instagram}><i className="bi bi-instagram me-1" /> Instagram</a>}
              {business?.facebook && <a className="btn btn-soft btn-sm" target="_blank" rel="noopener noreferrer" href={business.facebook}><i className="bi bi-facebook me-1" /> Facebook</a>}
            </div>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <h5 className="m-0">Servicios</h5>
          <div className="small text-muted">{services?.length || 0} disponibles</div>
        </div>

        {(!services || services.length === 0) ? (
          <div className="card p-4 text-muted">Este negocio aún no tiene servicios.</div>
        ) : (
          <div className="row g-3">
            {services.map(s => (
              <div key={s.serviceId} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 p-3 d-flex">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <strong className="me-2">{s.title}</strong>
                    <span className="badge text-bg-dark border" style={{ borderColor:'#2a3346' }}>
                      {s.durationMin} min
                    </span>
                  </div>
                  {s.description && <div className="small text-muted mt-1">{s.description}</div>}
                  <div className="mt-auto d-flex justify-content-between align-items-center pt-3">
                    <div className="fw-semibold">{priceFmt(s.price)}</div>
                    <Link to={bookingHref} className="btn btn-brand btn-sm" state={{ preselectedServiceId: s.serviceId }}>
                      <i className="bi bi-plus-lg me-1" /> Reservar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {business?.address && (
        <div className="col-12">
          <div className="card p-3">
            <h6 className="mb-1"><i className="bi bi-geo-alt me-1" /> Ubicación</h6>
            <div className="text-muted">{business.address}</div>
          </div>
        </div>
      )}
    </div>
  )
}
