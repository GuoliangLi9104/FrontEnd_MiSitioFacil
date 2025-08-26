import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'

export default function PublicSite(){
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [err, setErr]   = useState('')

  useEffect(()=>{
    (async ()=>{
      try {
        const res = await api.getBusinessBySlug(slug)
        setData(res)
      } catch(e) { setErr(e.message) }
    })()
  },[slug])

  if(err) return <div className="alert alert-danger">{err}</div>
  if(!data) return <div>Cargando...</div>

  const { business, services } = data

  return (
    <div className="row g-3">
      <div className="col-12">
        <div className="card p-4">
          <h2 className="brand-gradient">{business.name}</h2>
          <p className="text-secondary">{business.description}</p>
          <div className="d-flex gap-2">
            {business.phone && <a className="btn btn-success btn-sm" target="_blank" href={`https://wa.me/${business.phone.replace(/\D/g,'')}`}>WhatsApp</a>}
            <Link to={`/site/${slug}/booking`} className="btn btn-info btn-sm">Reservar</Link>
          </div>
        </div>
      </div>

      <div className="col-12">
        <h5 className="mb-2">Servicios</h5>
        <div className="row g-2">
          {(services||[]).map(s => (
            <div key={s.serviceId} className="col-md-4">
              <div className="card p-3 h-100">
                <strong>{s.title}</strong>
                <div className="small text-muted">{s.description}</div>
                <div className="mt-2">₡{Number(s.price).toFixed(2)} · {s.durationMin} min</div>
              </div>
            </div>
          ))}
          {(!services || services.length===0) && <div className="text-muted">Este negocio aún no tiene servicios.</div>}
        </div>
      </div>
    </div>
  )
}
