// src/components/PublishControl.jsx
import { useEffect, useState } from 'react'
import { api } from '../api'
import { buildPublicUrl } from '../utils/host'

export default function PublishControl({ slug, className = '' }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(null)
  const [fields, setFields] = useState({
    phone: true, address: true, website: true, instagram: true, facebook: true, coverUrl: true,
  })
  const [selected, setSelected] = useState(new Set())
  const [status, setStatus] = useState('idle') // idle|loading|ok|error
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!open) return
    const d = api.getLocalDraft(slug)
    setDraft(d)
    setSelected(new Set((d?.services || []).map(s => s.serviceId))) // por defecto: todos
  }, [open, slug])

  const toggleService = (id) => {
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const publish = async () => {
    setStatus('loading'); setMsg('')
    try {
      const res = await api.publishSelection(slug, {
        fields,
        serviceIds: Array.from(selected)
      })
      setStatus('ok'); setMsg('Publicado.')
      // abre subdominio/ruta
      const url = buildPublicUrl(slug)
      setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), 200)
      setOpen(false)
    } catch (e) {
      setStatus('error'); setMsg(e?.message || 'Error al publicar')
    }
  }

  return (
    <div className={className}>
      <button className="btn btn-brand btn-sm" onClick={() => setOpen(true)}>
        Publicar selección
      </button>

      {/* Modal simple controlado por estado */}
      {open && (
        <div className="position-fixed top-0 start-0 w-100 h-100" style={{background:'rgba(0,0,0,.4)', zIndex:1050}}>
          <div className="d-flex align-items-center justify-content-center w-100 h-100">
            <div className="card shadow" style={{width:'min(920px, 95vw)'}}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <strong>Publicar contenido</strong>
                <button className="btn btn-sm btn-outline-secondary" onClick={()=>setOpen(false)}>Cerrar</button>
              </div>
              <div className="card-body">
                {!draft ? (
                  <div className="text-muted">No hay borrador local para <code>{slug}</code>.</div>
                ) : (
                  <>
                    <div className="mb-3">
                      <div className="fw-semibold mb-2">Campos del negocio</div>
                      <div className="row g-2">
                        {[
                          ['phone','Teléfono'],
                          ['address','Dirección'],
                          ['website','Sitio web'],
                          ['instagram','Instagram'],
                          ['facebook','Facebook'],
                          ['coverUrl','Imagen de portada']
                        ].map(([k,label])=>(
                          <div key={k} className="col-6 col-md-4">
                            <label className="form-check">
                              <input className="form-check-input" type="checkbox"
                                     checked={!!fields[k]}
                                     onChange={e => setFields(f => ({...f, [k]: e.target.checked}))} />
                              <span className="form-check-label">{label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="fw-semibold mb-2">Servicios a publicar</div>
                      {(!draft.services || draft.services.length === 0) ? (
                        <div className="text-muted">Este borrador no tiene servicios.</div>
                      ) : (
                        <div className="row g-2">
                          {draft.services.map(s => (
                            <div className="col-12 col-md-6" key={s.serviceId}>
                              <label className="form-check d-flex align-items-center gap-2 p-2 border rounded">
                                <input className="form-check-input" type="checkbox"
                                       checked={selected.has(s.serviceId)}
                                       onChange={() => toggleService(s.serviceId)} />
                                <span className="fw-semibold">{s.title}</span>
                                <span className="ms-auto small text-muted">{s.durationMin} min · ₡{Number(s.price||0).toFixed(0)}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center">
                <div className={`small ${status==='error'?'text-danger':'text-muted'}`}>{msg}</div>
                <div className="d-flex gap-2">
                  <button className="btn btn-soft" onClick={()=>setOpen(false)}>Cancelar</button>
                  <button className="btn btn-brand" onClick={publish} disabled={!draft || status==='loading'}>
                    {status==='loading' ? 'Publicando…' : 'Publicar ahora'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
