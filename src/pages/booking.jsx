import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'

export default function Booking(){
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    (async ()=>{
      try {
        const res = await api.getBusinessBySlug(slug)
        setData(res)
      } catch(e) { setMsg(e.message) }
    })()
  },[slug])

  const submit = async e => {
    e.preventDefault()
    try {
      const payload = {
        businessId: data.business.businessId,
        serviceId,
        dateTime: new Date(`${date}T${time}:00`),
      }
      const r = await api.createReservation(payload)
      setMsg(`Reserva creada: ${r.reservationId || 'OK'}`)
    } catch(e) { setMsg(e.message) }
  }

  if(!data) return <div>Cargando...</div>

  return (
    <div className="card p-4">
      <h5 className="mb-3">Reservar en {data.business.name}</h5>
      <form className="row g-2" onSubmit={submit}>
        <div className="col-md-6">
          <label className="form-label">Servicio</label>
          <select className="form-select" value={serviceId} onChange={e=>setServiceId(e.target.value)} required>
            <option value="" disabled>Seleccione...</option>
            {data.services?.map(s => <option key={s.serviceId} value={s.serviceId}>{s.title} — ₡{Number(s.price).toFixed(2)}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Fecha</label>
          <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} required />
        </div>
        <div className="col-md-3">
          <label className="form-label">Hora</label>
          <input type="time" className="form-control" value={time} onChange={e=>setTime(e.target.value)} required />
        </div>
        <div className="col-12 mt-2">
          <button className="btn btn-info">Confirmar reserva</button>
        </div>
      </form>
      {msg && <div className="alert alert-secondary mt-3">{msg}</div>}
    </div>
  )
}
