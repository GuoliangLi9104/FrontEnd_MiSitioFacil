import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import TemplateCard from '../components/template-card.jsx'
import ServiceForm from '../components/service-form.jsx'
import ScheduleEditor from '../components/schedule-editor.jsx'

const demoTemplates = [
  { id:'classic', name:'Clásica', description:'Encabezado con imagen, sección de servicios y CTA de WhatsApp.', previewUrl:'https://picsum.photos/seed/classic/600/300' },
  { id:'modern',  name:'Moderna', description:'Hero minimalista, tarjetas de servicios y pie con redes.', previewUrl:'https://picsum.photos/seed/modern/600/300' },
  { id:'barber',  name:'Barbería', description:'Look oscuro, tipografías bold y bloque de reservas prominente.', previewUrl:'https://picsum.photos/seed/barber/600/300' }
]

export default function Builder(){
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [business, setBusiness] = useState({
    name:'', description:'', phone:'', address:'', templateId:'classic', slug:''
  })
  const [services, setServices] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    if(!token) navigate('/login')
  },[token])

  const selectTpl = tpl => setBusiness(b => ({...b, templateId: tpl.id}))
  const onSaveService = async (s) => {
    if (!s.serviceId) {
      const newItem = { ...s, id: crypto.randomUUID() }
      setServices(prev => [...prev, newItem])
    } else {
      setServices(prev => prev.map(x => (x.id===s.serviceId || x.serviceId===s.serviceId) ? {...x, ...s} : x))
    }
  }
  const onDeleteService = async (id) => {
    setServices(prev => prev.filter(x => (x.id||x.serviceId)!==id))
  }

  const onSaveSchedule = async (row) => {
    setMsg(`Horario guardado: día ${row.dayOfWeek}, ${row.startTime}-${row.endTime}`)
    setTimeout(()=>setMsg(''),2500)
  }

  const saveAll = async () => {
    try {
      setSaving(true)
      const slug = business.slug?.trim() || business.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      const payload = { ...business, slug, services }
      const data = await api.saveBusiness(token, payload)
      localStorage.setItem('ownerBusiness', JSON.stringify(data))
      setMsg('¡Guardado!')
      setTimeout(()=>setMsg(''),2500)
    } catch(e) {
      setMsg(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="row g-4">
      <div className="col-lg-6">
        <div className="card p-3">
          <h5 className="mb-3">Datos del negocio</h5>
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={business.name} onChange={e=>setBusiness({...business, name:e.target.value})} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Teléfono/WhatsApp</label>
              <input className="form-control" value={business.phone} onChange={e=>setBusiness({...business, phone:e.target.value})}/>
            </div>
            <div className="col-12">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows="2" value={business.description} onChange={e=>setBusiness({...business, description:e.target.value})}></textarea>
            </div>
            <div className="col-md-8">
              <label className="form-label">Dirección</label>
              <input className="form-control" value={business.address} onChange={e=>setBusiness({...business, address:e.target.value})}/>
            </div>
            <div className="col-md-4">
              <label className="form-label">Slug (URL)</label>
              <input className="form-control" placeholder="ej. barberia-mario" value={business.slug} onChange={e=>setBusiness({...business, slug:e.target.value})}/>
            </div>
          </div>
        </div>

        <div className="card p-3 mt-3">
          <h5 className="mb-3">Plantillas</h5>
          <div className="row g-3">
            {demoTemplates.map(t => (
              <div className="col-md-4" key={t.id}>
                <TemplateCard tpl={t} selected={business.templateId===t.id} onSelect={selectTpl}/>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-info" onClick={saveAll} disabled={saving}>{saving?'Guardando...':'Guardar todo'}</button>
          <button className="btn btn-outline-light" onClick={()=>navigate('/preview',{ state:{ business, services } })}>Ver vista previa</button>
        </div>
        {msg && <div className="alert alert-secondary mt-2">{msg}</div>}
      </div>

      <div className="col-lg-6">
        <h5 className="mb-2">Servicios</h5>
        <ServiceForm services={services} onSave={onSaveService} onDelete={onDeleteService} />

        <h5 className="mt-4 mb-2">Horarios disponibles</h5>
        <ScheduleEditor onSave={onSaveSchedule}/>
        <div className="small text-muted">Configura múltiples franjas por día (guárdalas una por una).</div>
      </div>
    </div>
  )
}
