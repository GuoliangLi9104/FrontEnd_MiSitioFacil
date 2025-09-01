// src/pages/preview.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { persist } from '../utils/persist'
import { renderTemplate, formatCRC } from '../utils/renderTemplate'
import { isOpenNow, nextChange, DAY_KEYS, DAY_LABELS, dayIntervalsLabel } from '../utils/schedule'

export default function Preview() {
  const [data, setData] = useState(null)
  const [html, setHtml] = useState('')
  const [openInfo, setOpenInfo] = useState({ open: false, nextAt: null, nextType: null })

  useEffect(() => {
    const draft = persist.load()
    setData(draft)

    const templateId = draft?.template || 'template1'
    fetch(`/templates/${templateId}.html`)
      .then(r => r.text())
      .then(tpl => setHtml(renderTemplate(tpl, draft || {})))
      .catch(() => setHtml('<div class="text-danger">No se pudo cargar la plantilla.</div>'))
  }, [])

  useEffect(() => {
    if (!data) return
    const update = () => {
      const open = isOpenNow(data.schedule || {})
      const nextObj = nextChange(data.schedule || {}) // { type, at: Date } | null
      const nextAt = nextObj?.at ?? null
      const nextType = nextObj?.type ?? null
      setOpenInfo({ open, nextAt, nextType })
    }
    update()
    const id = setInterval(update, 60 * 1000)
    return () => clearInterval(id)
  }, [data])

  const priceFmt = (n) => formatCRC(n)
  const phoneDigits = useMemo(() => (data?.business?.phone || '').replace(/\D/g, ''), [data])

  const fmtTime = (d) => d?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const fmtDate = (d) => d?.toLocaleDateString?.() // por si acaso

  if (!data) {
    return (
      <div className="card p-4">
        <h5 className="mb-2">Vista previa</h5>
        <p className="text-muted">Aún no hay borrador guardado. Vuelve al constructor, edita y regresa aquí.</p>
        <Link to="/builder" className="btn btn-brand btn-sm">Ir al constructor</Link>
      </div>
    )
  }

  const { business, services } = data

  return (
    <div className="vstack gap-3">
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="m-0">Vista previa</h4>
        <div className="d-flex gap-2">
          <Link className="btn btn-soft btn-sm" to="/builder">
            <i className="bi bi-pencil me-1" /> Seguir editando
          </Link>
          <Link className="btn btn-soft btn-sm" to="/templates">
            <i className="bi bi-layout-wtf me-1" /> Cambiar plantilla
          </Link>
          <Link className="btn btn-soft btn-sm" to="/schedule">
            <i className="bi bi-clock me-1" /> Editar horario
          </Link>
          <Link className="btn btn-brand btn-sm" to={`/site/${business.slug || 'demo'}`}>
            <i className="bi bi-box-arrow-up-right me-1" /> Ver página pública (demo)
          </Link>
        </div>
      </div>

      {/* Portada rápida */}
      <div className="card p-0 overflow-hidden">
        <div
          style={{
            width: '100%', minHeight: 180,
            backgroundImage: business?.coverUrl
              ? `url("${business.coverUrl}")`
              : 'linear-gradient(135deg, rgba(14,165,233,.25), rgba(139,92,246,.25))',
            backgroundPosition: 'center', backgroundSize: 'cover'
          }}
        />
        <div className="p-4">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: 64, height: 64, borderRadius: 16, display: 'grid', placeItems: 'center',
              background: 'rgba(255,255,255,.06)', border: '1px solid #2a3346',
              fontWeight: 700, fontSize: 22
            }}>
              {(business?.name || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-grow-1">
              <h2 className="m-0 brand-gradient">{business?.name || 'Sin nombre'}</h2>
              {business?.category && <div className="text-muted small mt-1">{business.category}</div>}
            </div>
          </div>

          {business?.description && (<p className="text-muted mt-3 mb-3">{business.description}</p>)}

          <div className="d-flex flex-wrap gap-2">
            {phoneDigits && (
              <a className="btn btn-success btn-sm" target="_blank" rel="noopener noreferrer"
                href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hola ${business?.name || ''}`)}`}>
                <i className="bi bi-whatsapp me-1" /> WhatsApp
              </a>
            )}
            <Link className="btn btn-brand btn-sm" to={`/site/${business.slug || 'demo'}/booking`}>
              <i className="bi bi-calendar-check me-1" /> Reservar
            </Link>
            {business?.website && (
              <a className="btn btn-soft btn-sm" target="_blank" rel="noopener noreferrer" href={business.website}>
                <i className="bi bi-globe me-1" /> Sitio web
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Estado de apertura + tabla semanal */}
      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">Horario</h5>
          <div>
            {openInfo.open ? (
              <span className="badge text-bg-success">Abierto ahora</span>
            ) : (
              <span className="badge text-bg-secondary">Cerrado</span>
            )}
            {' '}
            <span className="text-muted small">
              {openInfo.nextAt
                ? openInfo.open
                  ? `Cierra a las ${fmtTime(openInfo.nextAt)}`
                  : `Abre ${fmtDate(openInfo.nextAt)} a las ${fmtTime(openInfo.nextAt)}`
                : 'Sin próximo cambio'}
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr><th>Día</th><th>Horario</th></tr>
            </thead>
            <tbody>
              {DAY_KEYS.map(k => (
                <tr key={k}>
                  <td style={{ width: 140 }}>{DAY_LABELS[k]}</td>
                  <td className="text-muted">{dayIntervalsLabel(data.schedule || {}, k)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.schedule?.timezone && (
          <div className="text-muted small">Zona horaria de referencia: {data.schedule.timezone}</div>
        )}
      </div>

      {/* Render de la plantilla seleccionada */}
      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">Plantilla seleccionada</h5>
          <div className="small text-muted">{(services || []).length} servicios</div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Ubicación */}
      {business?.address && (
        <div className="card p-3">
          <h6 className="mb-1"><i className="bi bi-geo-alt me-1" /> Ubicación</h6>
          <div className="text-muted">{business.address}</div>
        </div>
      )}
    </div>
  )
}
