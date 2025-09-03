// src/pages/create.jsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import PublishButton from '../components/PublishButton.jsx'
import { buildPublicUrl } from '../utils/host'

const TEMPLATES = [
  { key: 'barber-basic-1', name: 'Barbería Básico', description: 'Secciones esenciales para barberías.', previewUrl: '/templates/barber-basic-1.png' },
  { key: 'spa-clean-1',    name: 'Spa Clean',       description: 'Diseño limpio para spas y wellness.', previewUrl: '/templates/spa-clean-1.png' }
]

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const LABEL = { monday:'Lunes', tuesday:'Martes', wednesday:'Miércoles', thursday:'Jueves', friday:'Viernes', saturday:'Sábado', sunday:'Domingo' }

function useQuery(){ const { search } = useLocation(); return useMemo(()=>new URLSearchParams(search),[search]) }
const slugify = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9- ]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-')

function defaultHours() {
  const base = { isOpen:false, openTime:'09:00', closeTime:'18:00' }
  return DAYS.reduce((acc, d) => (acc[d] = { ...base }, acc), {})
}

export default function CreatePage(){
  const q = useQuery()
  const navigate = useNavigate()

  const [businessId, setBusinessId] = useState(q.get('id') || null)
  const [form, setForm] = useState({
    name:'', slug:'', category:'', description:'',
    phone:'', address:'', instagram:'', facebook:'', website:'',
    templateKey: TEMPLATES[0].key, coverUrl:''
  })
  const [services, setServices] = useState([])
  const [hours, setHours] = useState(defaultHours())

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // ------------ LOAD (editar) ------------
  useEffect(() => {
    (async () => {
      if (!businessId) return
      try {
        // Obtenemos “mis negocios” y localizamos el que vamos a editar
        const mine = await api.listMyBusinesses()
        const items = mine?.items || mine?.data?.businesses || []
        const found = items.find(x => (x._id || x.id) === businessId)
        if (found) {
          setForm(f => ({
            ...f,
            name: found.name || '',
            slug: found.slug || '',
            category: found.category || '',
            description: found.description || '',
            phone: found.phone || '',
            address: found.address || '',
            instagram: found.instagram || '',
            facebook: found.facebook || '',
            website: found.website || '',
            templateKey: found.templateKey || found.templateId || TEMPLATES[0].key,
            coverUrl: found.coverUrl || ''
          }))
          if (found.operatingHours) setHours(h => ({ ...h, ...found.operatingHours }))
          // Si tu API te devuelve servicios, mapéalos aquí:
          if (Array.isArray(found.services)) {
            setServices(found.services.map(s => ({
              _id: s._id,
              title: s.title || s.name || '',
              description: s.description || '',
              price: Number(s.price || 0),
              durationMin: Number(s.durationMin || s.duration || 30)
            })))
          }
        }
      } catch (e) {
        console.warn('No se pudo cargar el negocio:', e?.message || e)
      }
    })()
  }, [businessId])

  // ------------ FORM ------------
  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const onNameBlur = () => { if (!form.slug && form.name) setForm(f => ({ ...f, slug: slugify(f.name) })) }
  const onSlugBlur = () => setForm(f => ({ ...f, slug: slugify(f.slug) }))

  // ------------ SERVICES ------------
  const addService = () => {
    setServices(s => [...s, { tempId: crypto.randomUUID?.() || String(Date.now()), title:'', price:0, durationMin:30, description:'' }])
  }
  const updateService = (idx, key, val) => {
    setServices(list => {
      const next = list.slice()
      next[idx] = { ...next[idx], [key]: key==='price'||key==='durationMin' ? Number(val||0) : val }
      return next
    })
  }
  const removeService = (idx) => setServices(list => list.filter((_,i) => i!==idx))

  // ------------ HOURS ------------
  const toggleDay = (day) => setHours(h => ({ ...h, [day]: { ...h[day], isOpen: !h[day].isOpen } }))
  const setTime = (day, which, val) => setHours(h => ({ ...h, [day]: { ...h[day], [which]: val } }))

  // ------------ SUBMIT (create/update) ------------
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      if (!form.name || !form.slug) { setMsg('Nombre y subdominio (slug) son obligatorios'); setLoading(false); return }

      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug),
        category: form.category || '',
        description: form.description || '',
        phone: form.phone || '',
        address: form.address || '',
        instagram: form.instagram || '',
        facebook: form.facebook || '',
        website: form.website || '',
        templateKey: form.templateKey,
        coverUrl: form.coverUrl || '',
        operatingHours: hours,
        services: services.map(s => ({
          // El backend puede mapear title->name y durationMin->duration
          title: (s.title || '').trim(),
          description: (s.description || '').trim(),
          price: Number(s.price || 0),
          durationMin: Number(s.durationMin || 30),
          _id: s._id // si existe, sirve para “update” en backend
        }))
      }

      if (businessId) {
        await api.updateBusiness(businessId, payload)
        setMsg('Cambios guardados.')
      } else {
        const created = await api.createBusiness(payload)
        const newId = created?.item?._id || created?._id || created?.id || created?.businessId
        if (newId) setBusinessId(newId)
        setMsg('Página creada.')
      }
    } catch (e) {
      setMsg(e?.message || 'Error guardando')
    } finally {
      setLoading(false)
    }
  }

  const publicUrl = form.slug ? buildPublicUrl(form.slug) : ''

  return (
    <div className="container py-3">
      <h3 className="mb-3">{businessId ? 'Editar página' : 'Crear página'}</h3>
      {msg && <div className="alert alert-info">{msg}</div>}

      <form className="vstack gap-4" onSubmit={submit}>
        {/* --- Datos básicos --- */}
        <section className="card p-3">
          <h6 className="mb-3">Datos del negocio</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre del negocio</label>
              <input name="name" className="form-control" value={form.name} onChange={onChange} onBlur={onNameBlur} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Subdominio (slug)</label>
              <input name="slug" className="form-control" value={form.slug} onChange={onChange} onBlur={onSlugBlur} placeholder="barberiacarlos" required />
              <div className="form-text">Se publicará en: {form.slug ? <code>{publicUrl}</code> : '—'}</div>
            </div>

            <div className="col-md-4">
              <label className="form-label">Categoría</label>
              <input name="category" className="form-control" value={form.category} onChange={onChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Teléfono</label>
              <input name="phone" className="form-control" value={form.phone} onChange={onChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Dirección</label>
              <input name="address" className="form-control" value={form.address} onChange={onChange} />
            </div>

            <div className="col-md-4">
              <label className="form-label">Instagram</label>
              <input name="instagram" className="form-control" value={form.instagram} onChange={onChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Facebook</label>
              <input name="facebook" className="form-control" value={form.facebook} onChange={onChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Sitio web</label>
              <input name="website" className="form-control" value={form.website} onChange={onChange} />
            </div>

            <div className="col-12">
              <label className="form-label">Descripción</label>
              <textarea name="description" className="form-control" rows="3" value={form.description} onChange={onChange} />
            </div>
          </div>
        </section>

        {/* --- Plantilla --- */}
        <section className="card p-3">
          <h6 className="mb-3">Plantilla</h6>
          <div className="d-flex flex-wrap gap-3">
            {TEMPLATES.map(tpl => (
              <button
                type="button"
                key={tpl.key}
                className={`btn ${form.templateKey === tpl.key ? 'btn-brand' : 'btn-soft'}`}
                onClick={()=>setForm(f => ({ ...f, templateKey: tpl.key }))}
                title={tpl.description}
              >
                {form.templateKey === tpl.key && <i className="bi bi-check-lg me-1" />}
                {tpl.name}
              </button>
            ))}
          </div>
        </section>

        {/* --- Servicios --- */}
        <section className="card p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="m-0">Servicios</h6>
            <button type="button" className="btn btn-sm btn-soft" onClick={addService}>
              <i className="bi bi-plus-lg me-1" /> Añadir servicio
            </button>
          </div>
          {services.length === 0 && <div className="text-muted">Aún no has añadido servicios.</div>}
          <div className="vstack gap-2">
            {services.map((s, idx) => (
              <div key={s._id || s.tempId || idx} className="row g-2 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">Título</label>
                  <input className="form-control" value={s.title} onChange={e=>updateService(idx,'title',e.target.value)} placeholder="Corte clásico" />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Precio</label>
                  <input type="number" className="form-control" value={s.price} onChange={e=>updateService(idx,'price',e.target.value)} min="0" />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Duración (min)</label>
                  <input type="number" className="form-control" value={s.durationMin} onChange={e=>updateService(idx,'durationMin',e.target.value)} min="5" step="5" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Descripción</label>
                  <input className="form-control" value={s.description} onChange={e=>updateService(idx,'description',e.target.value)} placeholder="Tijera y máquina" />
                </div>
                <div className="col-md-1">
                  <button type="button" className="btn btn-outline-danger w-100" onClick={()=>removeService(idx)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Horario de atención --- */}
        <section className="card p-3">
          <h6 className="mb-3">Horario de atención</h6>
          <div className="table-responsive">
            <table className="table table-dark align-middle m-0">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Abierto</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day}>
                    <td>{LABEL[day]}</td>
                    <td>
                      <input type="checkbox" className="form-check-input" checked={!!hours[day]?.isOpen} onChange={()=>toggleDay(day)} />
                    </td>
                    <td>
                      <input type="time" className="form-control" value={hours[day]?.openTime || '09:00'} onChange={e=>setTime(day,'openTime',e.target.value)} disabled={!hours[day]?.isOpen} />
                    </td>
                    <td>
                      <input type="time" className="form-control" value={hours[day]?.closeTime || '18:00'} onChange={e=>setTime(day,'closeTime',e.target.value)} disabled={!hours[day]?.isOpen} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- Acciones --- */}
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-primary" disabled={loading}>
            {loading ? (businessId ? 'Guardando…' : 'Creando…') : (businessId ? 'Guardar cambios' : 'Crear página')}
          </button>
          {form.slug && <PublishButton slug={form.slug} openAfter />}
          <button type="button" className="btn btn-soft" onClick={()=>navigate('/')}>Volver</button>
        </div>
      </form>
    </div>
  )
}
