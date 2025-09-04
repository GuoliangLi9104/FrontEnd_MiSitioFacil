// src/pages/create.jsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import PublishButton from '../components/PublishButton.jsx'
import ImagePicker from '../components/ImagePicker.jsx'
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

  // estado por servicio para el botón Guardar
  // svcStatus[key] = { saving: bool, saved: bool, error: string|null }
  const [svcStatus, setSvcStatus] = useState({})

  // ------------ LOAD (editar) ------------
  useEffect(() => {
    (async () => {
      if (!businessId) return
      try {
        const mine = await api.listMyBusinesses()
        const items = mine?.items || mine?.data?.businesses || mine?.data || []
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
            coverUrl: found.coverUrl || found?.coverImage?.url || ''
          }))
          if (found.operatingHours) setHours(h => ({ ...h, ...found.operatingHours }))
          if (Array.isArray(found.services)) {
            setServices(found.services.map(s => ({
              _id: s._id || s.id,
              title: s.title || s.name || '',
              description: s.description || '',
              price: Number(s.price ?? s?.pricing?.basePrice ?? 0),
              durationMin: Number(s.durationMin ?? s.duration ?? 30)
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
    // reinicia estado visual si edita
    setSvcStatus(prev => {
      const keyId = services[idx]?._id || services[idx]?.tempId || idx
      const curr = prev[keyId] || {}
      return { ...prev, [keyId]: { ...curr, saved: false, error: null } }
    })
  }
  const removeService = (idx) => {
    const keyId = services[idx]?._id || services[idx]?.tempId || idx
    setServices(list => list.filter((_,i) => i!==idx))
    setSvcStatus(prev => {
      const cp = { ...prev }
      delete cp[keyId]
      return cp
    })
  }

  // ------------ HOURS ------------
  const toggleDay = (day) => setHours(h => ({ ...h, [day]: { ...h[day], isOpen: !h[day].isOpen } }))
  const setTime = (day, which, val) => setHours(h => ({ ...h, [day]: { ...h[day], [which]: val } }))

  // ------------ Guardar servicio (POST/PUT individual) ------------
  const isServiceReady = (s) =>
    String(s.title || '').trim().length > 0 &&
    Number.isFinite(Number(s.price)) &&
    Number(s.price) >= 0 &&
    Number(s.durationMin) >= 15 && Number(s.durationMin) % 15 === 0

  const saveService = async (idx) => {
    const s = services[idx]
    if (!s) return
    const keyId = s._id || s.tempId || idx

    if (!isServiceReady(s)) {
      setSvcStatus(prev => ({ ...prev, [keyId]: { saving: false, saved: false, error: 'Completa título, precio (≥ 0) y duración (múltiplos de 15).' } }))
      return
    }
    if (!businessId) {
      setSvcStatus(prev => ({ ...prev, [keyId]: { saving: false, saved: false, error: 'Primero guarda el negocio para obtener su ID.' } }))
      return
    }

    setSvcStatus(prev => ({ ...prev, [keyId]: { saving: true, saved: false, error: null } }))

    try {
      let resp
      if (s._id) {
        // actualizar
        resp = await api.updateService(s._id, {
          title: s.title,
          description: s.description,
          price: s.price,
          durationMin: s.durationMin
        })
      } else {
        // crear
        resp = await api.createService(businessId, {
          title: s.title,
          description: s.description,
          price: s.price,
          durationMin: s.durationMin
        })
      }

      const newId =
        resp?.data?.service?._id ||
        resp?.data?.service?.id ||
        resp?.service?._id ||
        resp?.service?.id ||
        s._id || keyId

      // sincroniza _id devuelto
      setServices(list => {
        const next = list.slice()
        next[idx] = { ...next[idx], _id: newId }
        return next
      })

      setSvcStatus(prev => ({ ...prev, [newId]: { saving: false, saved: true, error: null } }))
      if (newId !== keyId) {
        setSvcStatus(prev => {
          const cp = { ...prev }
          delete cp[keyId]
          return cp
        })
      }
    } catch (e) {
      setSvcStatus(prev => ({ ...prev, [keyId]: { saving: false, saved: false, error: e?.message || 'Error al guardar el servicio.' } }))
    }
  }

  // ------------ Guardar SOLO el negocio (imagen + plantilla + básicos) ------------
  const saveBusinessOnly = async () => {
    setLoading(true)
    setMsg('')
    try {
      if (!form.name || !form.slug) {
        setMsg('Nombre y subdominio (slug) son obligatorios')
        setLoading(false)
        return
      }

      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug || form.name),
        category: form.category || '',
        description: form.description || '',
        phone: form.phone || '',
        address: form.address || '',
        instagram: form.instagram || '',
        facebook: form.facebook || '',
        website: form.website || '',
        templateKey: form.templateKey,
        coverUrl: form.coverUrl || ''
        // NO enviamos horarios ni servicios aquí
      }

      let id = businessId

      if (id) {
        await api.updateBusiness(id, payload)
        setMsg('✅ Negocio actualizado.')
      } else {
        const created = await api.createBusiness(payload)

        // Intentamos obtener el id de varias formas posibles
        id =
          created?.item?._id ||
          created?.data?.business?._id ||
          created?.data?.id ||
          created?.data?._id ||
          created?._id ||
          created?.id ||
          created?.businessId ||
          null

        // Si no llegó el id, lo resolvemos buscando por slug en "mis negocios"
        if (!id) {
          try {
            const mine = await api.listMyBusinesses()
            const items = mine?.items || mine?.data?.businesses || mine?.data || []
            const found = items.find(b => (b.slug || b?.business?.slug || '').toLowerCase() === slugify(payload.slug))
            id = found?._id || found?.id || null
          } catch { /* noop */ }
        }

        if (id) {
          setBusinessId(id)
          // Fijamos el id en la URL para persistirlo
          try {
            navigate(`/create?id=${encodeURIComponent(id)}`, { replace: true })
          } catch { /* noop */ }
        }

        setMsg('✅ Negocio creado. Ya puedes agregar servicios y horario.')
      }
    } catch (e) {
      setMsg(e?.message || '❌ Error guardando el negocio.')
    } finally {
      setLoading(false)
    }
  }

  // ------------ Guardar TODO (incluye horario + listado actual) ------------
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
          title: (s.title || '').trim(),
          description: (s.description || '').trim(),
          price: Number(s.price || 0),
          durationMin: Number(s.durationMin || 30),
          _id: s._id
        }))
      }

      if (businessId) {
        await api.updateBusiness(businessId, payload)
        setMsg('Cambios guardados.')
      } else {
        const created = await api.createBusiness(payload)
        const newId = created?.item?._id || created?.data?.business?._id || created?._id || created?.id || created?.businessId
        if (newId) {
          setBusinessId(newId)
          try { navigate(`/create?id=${encodeURIComponent(newId)}`, { replace: true }) } catch {}
        }
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

            {/* Imagen de portada */}
            <div className="col-12">
              <label className="form-label">Imagen de portada</label>
              <ImagePicker
                value={form.coverUrl}
                onChange={(val) => setForm(f => ({ ...f, coverUrl: val }))}
                maxW={1600}
                maxH={900}
                maxMB={5}
              />
              <div className="form-text">Formatos recomendados: JPG/PNG. Relación aprox. 16:9.</div>
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

        {/* --- Botón: Guardar solo negocio (justo después de Plantilla) --- */}
        <section className="card p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Guarda el negocio con su imagen y plantilla. Luego podrás añadir servicios y horario.
            </div>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={saveBusinessOnly}
              disabled={loading}
            >
              {loading ? 'Guardando…' : (businessId ? 'Guardar negocio' : 'Crear negocio')}
            </button>
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
            {services.map((s, idx) => {
              const keyId = s._id || s.tempId || idx
              const st = svcStatus[keyId] || { saving: false, saved: false, error: null }
              const disabled = !businessId || !isServiceReady(s) || st.saving
              return (
                <div key={keyId} className="row g-2 align-items-end">
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
                    <input type="number" className="form-control" value={s.durationMin} onChange={e=>updateService(idx,'durationMin',e.target.value)} min="15" step="15" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Descripción</label>
                    <input className="form-control" value={s.description} onChange={e=>updateService(idx,'description',e.target.value)} placeholder="Tijera y máquina" />
                  </div>

                  <div className="col-md-2 d-flex gap-2">
                    {/* Guardar */}
                    <button
                      type="button"
                      className="btn btn-primary flex-fill"
                      onClick={()=>saveService(idx)}
                      disabled={disabled}
                      title={businessId ? (isServiceReady(s) ? 'Guardar este servicio' : 'Completa título, precio y duración (múltiplos de 15)') : 'Primero guarda el negocio'}
                    >
                      {st.saving ? (
                        <>
                          <i className="bi bi-arrow-repeat me-1" /> Guardando…
                        </>
                      ) : st.saved ? (
                        <>
                          <i className="bi bi-check2-circle me-1" /> Guardado
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-upload me-1" /> Guardar
                        </>
                      )}
                    </button>

                    {/* Eliminar */}
                    <button type="button" className="btn btn-outline-danger" onClick={()=>removeService(idx)}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>

                  {/* Estado de error debajo, si aplica */}
                  {st.error && (
                    <div className="col-12">
                      <div className="text-danger small">
                        <i className="bi bi-exclamation-triangle me-1" />
                        {st.error}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
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
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Botón global para guardar TODO */}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? (businessId ? 'Guardando…' : 'Creando…') : (businessId ? 'Guardar TODO' : 'Crear página completa')}
          </button>

          {form.slug && <PublishButton slug={form.slug} openAfter />}
          <button type="button" className="btn btn-soft" onClick={()=>navigate('/')}>Volver</button>
        </div>
      </form>
    </div>
  )
}
