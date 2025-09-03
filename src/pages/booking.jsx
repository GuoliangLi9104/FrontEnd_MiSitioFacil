// src/pages/booking.jsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api.js'

const fmtLocal = (iso) => {
  try {
    const d = new Date(iso)
    return d.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' })
  } catch { return iso }
}

export default function Booking() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [services, setServices] = useState([])

  const [form, setForm] = useState({
    serviceId: '',
    fullName: '',
    datetime: '', // input type=datetime-local
    phone: '',
    notes: ''
  })
  const [msg, setMsg] = useState('')

  // Cargar servicios publicados del negocio
  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true); setError(''); setMsg('')
      try {
        const svcs = await api.getServicesBySlug(slug)
        if (!alive) return
        setServices(svcs)
        // si hay solo uno, preselecciona
        if (svcs.length === 1) {
          setForm(f => ({ ...f, serviceId: svcs[0].serviceId }))
        }
      } catch (e) {
        setError(String(e?.message || e))
      } finally {
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [slug])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const canSubmit = useMemo(() => {
    if (!form.serviceId) return false
    if (!form.fullName.trim()) return false
    if (!form.datetime) return false
    return true
  }, [form])

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg(''); setError('')
    try {
      const datetimeISO = new Date(form.datetime).toISOString()
      const res = await api.createBooking(slug, {
        serviceId: form.serviceId,
        fullName: form.fullName.trim(),
        datetimeISO,
        phone: form.phone.trim(),
        notes: form.notes.trim()
      })
      if (!res?.ok) throw new Error('No se pudo reservar')
      setMsg(`✅ Reserva creada. ${fmtLocal(datetimeISO)}`)
      // limpiar (deja el servicio seleccionado)
      setForm(f => ({ ...f, fullName:'', datetime:'', phone:'', notes:'' }))
    } catch (err) {
      setError(String(err?.message || err))
    }
  }

  return (
    <div className="container my-3">
      <h2 className="mb-2">Reservar cita</h2>
      <p className="text-muted">Elige un servicio y completa tus datos.</p>

      {loading && <div className="card p-3">Cargando…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {services.length === 0 ? (
            <div className="alert alert-info">
              Este sitio no tiene servicios publicados por ahora. <Link to={`/site/${slug}`}>Volver</Link>
            </div>
          ) : (
            <form className="card p-3" onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label">Servicio</label>
                <select
                  className="form-select"
                  name="serviceId"
                  value={form.serviceId}
                  onChange={onChange}
                  required
                >
                  <option value="">Selecciona…</option>
                  {services.map(s => (
                    <option key={s.serviceId} value={s.serviceId}>
                      {s.title} — ₡{Number(s.price || 0).toFixed(0)} · {s.durationMin} min
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Tu nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="fullName"
                  placeholder="Nombre y apellido"
                  value={form.fullName}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Fecha y hora</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="datetime"
                  value={form.datetime}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Teléfono (opcional)</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  placeholder="+506 8888 0000"
                  value={form.phone}
                  onChange={onChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Notas (opcional)</label>
                <textarea
                  className="form-control"
                  name="notes"
                  rows={3}
                  placeholder="Algo que debamos saber…"
                  value={form.notes}
                  onChange={onChange}
                />
              </div>

              <div className="d-flex align-items-center gap-3">
                <button className="btn btn-primary" type="submit" disabled={!canSubmit}>Reservar</button>
                {msg && <span className="text-success">{msg}</span>}
              </div>
            </form>
          )}

          <div className="mt-3">
            <Link to={`/site/${slug}`}>← Volver al sitio</Link>
          </div>
        </>
      )}
    </div>
  )
}
