import { useLocation } from 'react-router-dom'

export default function Preview(){
  const { state } = useLocation()
  const business = state?.business
  const services = state?.services || []

  if(!business) {
    return <div className="alert alert-warning">No hay datos para previsualizar. Ve al constructor.</div>
  }

  return (
    <div>
      <h4 className="mb-3">Vista previa — {business.name}</h4>
      <div className="preview-frame">
        <header className="mb-3">
          <h2 className="brand-gradient">{business.name}</h2>
          <p className="text-secondary">{business.description}</p>
          {business.phone && (
            <a className="btn btn-success btn-sm" target="_blank" href={`https://wa.me/${business.phone.replace(/\D/g,'')}`}>WhatsApp</a>
          )}
        </header>
        <section className="mb-3">
          <h5>Servicios</h5>
          <div className="row g-2">
            {services.map(s => (
              <div key={s.id || s.serviceId} className="col-md-4">
                <div className="card p-3 h-100">
                  <strong>{s.title}</strong>
                  <div className="small text-muted">{s.description}</div>
                  <div className="mt-2">₡{Number(s.price).toFixed(2)} · {s.durationMin} min</div>
                </div>
              </div>
            ))}
            {services.length===0 && <div className="text-muted">Aún no has agregado servicios.</div>}
          </div>
        </section>
        <footer className="pt-2 border-top border-secondary">
          <div className="small">Dirección: {business.address || 'No especificada'}</div>
          <div className="small">Plantilla: {business.templateId}</div>
        </footer>
      </div>
    </div>
  )
}
