// src/pages/booking.jsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

export default function Booking() {
  const { slug } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [serviceId, setServiceId] = useState(state?.preselectedServiceId || '')
  const [customerName, setCustomerName] = useState('')
  const [when, setWhen] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const list = await api.getServicesBySlug(slug)
        if (!alive) return
        setServices(list)
        if (!serviceId && list.length) setServiceId(list[0].serviceId)
      } catch (e) {
        setErr(e?.message || 'No se pudieron cargar servicios')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [slug])

  const priceFmt = (n) => {
    try {
      return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(Number(n || 0))
    } catch {
      return `₡${Number(n || 0).toFixed(0)}`
    }
  }

  const selected = useMemo(
    () => services.find(s => s.serviceId === serviceId),
    [services, serviceId]
  )

  const submit = async (e) => {
    e.preventDefault()
    try {
      const r = await api.createBooking({ slug, serviceId, customerName, when })
      alert(r.message || 'Reserva creada')
      navigate(`/site/${slug}`)
    } catch (e2) {
      setErr(e2?.message || 'No se pudo crear la reserva')
    }
  }

  if (loading) {
    return (
      <div className="card p-4">
        <div className="placeholder-glow">
          <h4 className="placeholder col-6"></h4>
          <p className="placeholder col-10"></p>
        </div>
      </div>
    )
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <div className="card p-4">
          <h4 className="mb-2">Reservar cita</h4>
          <p className="text-muted">Elige un servicio y completa tus datos.</p>
          {err && <div className="alert alert-danger">{err}</div>}

          <form onSubmit={submit} className="vstack gap-3">
            <div>
              <label className="form-label">Servicio</label>
              <select
                className="form-select"
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                required
              >
                {services.map(s => (
                  <option key={s.serviceId} value={s.serviceId}>
                    {s.title} — {priceFmt(s.price)} · {s.durationMin} min
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Tu nombre</label>
              <input
                className="form-control"
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Nombre y apellido"
                required
              />
            </div>

            <div>
              <label className="form-label">Fecha y hora</label>
              <input
                className="form-control"
                type="datetime-local"
                value={when}
                onChange={e => setWhen(e.target.value)}
                required
              />
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-brand" type="submit">
                <i className="bi bi-check2-circle me-1" /> Confirmar
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn btn-soft">
                Cancelar
              </button>
            </div>

            {selected && (
              <div className="small text-muted">
                Seleccionado: <strong>{selected.title}</strong> — {priceFmt(selected.price)} · {selected.durationMin} min
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
