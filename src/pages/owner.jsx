// src/pages/owner.jsx
import { useEffect, useMemo, useState } from 'react'
import { api, BACKEND_CONFIGURED } from '../api'

const norm = s => String(s || '').trim().toLowerCase()
const isLocalHost = ['localhost','127.0.0.1'].includes(window.location.hostname)

export default function OwnerPage() {
  const [sites, setSites] = useState([])
  const [selectedSlug, setSelectedSlug] = useState('')
  const [current, setCurrent] = useState(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [msg, setMsg] = useState('')

  // estados de edición
  const [editBiz, setEditBiz] = useState(false)
  const [bizForm, setBizForm] = useState({ name:'', category:'', description:'', phone:'', address:'', website:'', instagram:'', facebook:'', coverUrl:'' })
  const [editServiceId, setEditServiceId] = useState(null)
  const [svcForm, setSvcForm] = useState({ title:'', description:'', price:0, durationMin:30, __selected:true })

  // cargar lista
  useEffect(() => {
    const items = (api.listLocalSites?.() || []).map(s => ({ ...s, slug: norm(s.slug) }))
    setSites(items)
    if (items.length && !selectedSlug) setSelectedSlug(items[0].slug)
  }, [])

  // cargar draft del slug
  useEffect(() => {
    if (!selectedSlug) { setCurrent(null); return }
    const draft = api.getLocalDraft?.(norm(selectedSlug))
    if (!draft) { setCurrent(null); return }

    const clone = JSON.parse(JSON.stringify(draft))
    const ensureOneSelected = (arr, key='__selected') => {
      if (!Array.isArray(arr) || arr.length === 0) return arr
      if (!arr.some(x => !!x[key])) arr[0][key] = true
      return arr
    }
    clone.business = { ...clone.business, slug: norm(clone.business?.slug || selectedSlug) }
    clone.services = ensureOneSelected(clone.services || [])
    // products si más tarde quieres: clone.products = ensureOneSelected(clone.products || [])
    setCurrent(clone)

    // reset edición al cambiar de sitio
    setEditBiz(false)
    setEditServiceId(null)
    window.__lastOwnerSlug = clone.business.slug
  }, [selectedSlug])

  // canPublish
  const canPublish = useMemo(() => {
    if (!current?.business?.slug) return false
    const hasCollections = (current.services?.length)
    if (!hasCollections) return true
    const anySel = (current.services || []).some(s => !!s.__selected)
    return anySel
  }, [current])

  // toggles selección
  const toggleService = (id) => {
    setCurrent(prev => {
      if (!prev) return prev
      const next = { ...prev }
      next.services = (next.services || []).map(s =>
        s.serviceId === id ? { ...s, __selected: !s.__selected } : s
      )
      return next
    })
  }
  const selectAll = (value) => {
    setCurrent(prev => {
      if (!prev) return prev
      const next = { ...prev }
      next.services = (next.services || []).map(s => ({ ...s, __selected: value }))
      return next
    })
  }

  // ====== edición de negocio ======
  const startEditBiz = () => {
    if (!current) return
    const b = current.business || {}
    setBizForm({
      name: b.name || '',
      category: b.category || '',
      description: b.description || '',
      phone: b.phone || '',
      address: b.address || '',
      website: b.website || '',
      instagram: b.instagram || '',
      facebook: b.facebook || '',
      coverUrl: b.coverUrl || ''
    })
    setEditBiz(true)
  }
  const cancelEditBiz = () => setEditBiz(false)
  const saveEditBiz = () => {
    const slug = current.business.slug
    api.updateBusinessDraft(slug, { ...bizForm })
    // recargar draft
    const updated = api.getLocalDraft(slug)
    setCurrent(updated)
    setEditBiz(false)
    setMsg('Datos del negocio guardados en borrador.')
  }

  // ====== edición de servicio ======
  const startEditService = (service) => {
    setEditServiceId(service?.serviceId || 'new')
    setSvcForm({
      title: service?.title || '',
      description: service?.description || '',
      price: Number(service?.price || 0),
      durationMin: Number(service?.durationMin || 30),
      __selected: service?.__selected ?? true
    })
  }
  const cancelEditService = () => {
    setEditServiceId(null)
    setSvcForm({ title:'', description:'', price:0, durationMin:30, __selected:true })
  }
  const saveEditService = () => {
    const slug = current.business.slug
    const payload = {
      serviceId: editServiceId === 'new' ? undefined : editServiceId,
      title: svcForm.title,
      description: svcForm.description,
      price: Number(svcForm.price || 0),
      durationMin: Number(svcForm.durationMin || 30),
      __selected: !!svcForm.__selected
    }
    const saved = api.upsertServiceDraft(slug, payload)
    // recargar draft
    const updated = api.getLocalDraft(slug)
    setCurrent(updated)
    setEditServiceId(null)
    setMsg(`Servicio "${saved.title}" guardado en borrador.`)
  }
  const deleteService = (id) => {
    const slug = current.business.slug
    api.deleteServiceDraft(slug, id)
    const updated = api.getLocalDraft(slug)
    setCurrent(updated)
    setMsg('Servicio eliminado del borrador.')
  }

  // publicar
  const doPublish = async () => {
    if (!current?.business?.slug) { setMsg('Sin slug'); return }
    setMsg('')
    try {
      setIsPublishing(true)
      const slug = norm(current.business.slug)
      window.__lastOwnerSlug = slug

      const serviceIds = (current.services || [])
        .filter(s => !!s.__selected)
        .map(s => s.serviceId)

      const res = await api.publishSelection(slug, {
        fields: { phone:true, address:true, website:true, instagram:true, facebook:true, coverUrl:true },
        serviceIds
      })
      if (!res?.ok && res?.source !== 'local') throw new Error('No se pudo publicar')

      setMsg('¡Publicado con éxito!')
      const url = (!BACKEND_CONFIGURED || isLocalHost) ? `/site/${slug}` : `https://${slug}.misitiofacil.org`
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      console.error(e)
      setMsg(`Error: ${e.message}`)
    } finally {
      setIsPublishing(false)
    }
  }

  // UI helpers
  const onBizInput = (e) => setBizForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const onSvcInput = (e) => setSvcForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const priceCR = (n) => {
    try {
      return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(Number(n||0))
    } catch {
      return `₡${Number(n||0).toFixed(0)}`
    }
  }

  return (
    <div className="container">
      <h2 className="mb-3">Publicar sitio</h2>

      {/* Selector de borrador */}
      <div className="card p-3 mb-3">
        <label className="form-label">Selecciona el borrador</label>
        <select
          className="form-select"
          value={selectedSlug}
          onChange={e => setSelectedSlug(norm(e.target.value))}
        >
          {sites.map(s => (
            <option key={s.slug} value={s.slug}>
              {s.name} ({s.slug})
            </option>
          ))}
        </select>
      </div>

      {!current && <div className="alert alert-warning">No hay draft para este slug.</div>}

      {current && (
        <div className="row g-3">
          {/* Datos Negocio */}
          <div className="col-12">
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Datos del negocio</h5>
                {!editBiz ? (
                  <button className="btn btn-sm btn-outline-primary" onClick={startEditBiz}>Editar</button>
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-success" onClick={saveEditBiz}>Guardar</button>
                    <button className="btn btn-sm btn-secondary" onClick={cancelEditBiz}>Cancelar</button>
                  </div>
                )}
              </div>

              {!editBiz ? (
                <div className="mt-2">
                  <div><b>Nombre:</b> {current.business?.name}</div>
                  <div><b>Slug:</b> {current.business?.slug}</div>
                  <div><b>Categoría:</b> {current.business?.category}</div>
                  <div><b>Descripción:</b> {current.business?.description}</div>
                  <div><b>Teléfono:</b> {current.business?.phone}</div>
                  <div><b>Dirección:</b> {current.business?.address}</div>
                  <div><b>Web:</b> {current.business?.website}</div>
                  <div><b>Instagram:</b> {current.business?.instagram}</div>
                  <div><b>Facebook:</b> {current.business?.facebook}</div>
                </div>
              ) : (
                <div className="row mt-3 g-2">
                  <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input className="form-control" name="name" value={bizForm.name} onChange={onBizInput} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Categoría</label>
                    <input className="form-control" name="category" value={bizForm.category} onChange={onBizInput} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" name="description" rows={2} value={bizForm.description} onChange={onBizInput} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input className="form-control" name="phone" value={bizForm.phone} onChange={onBizInput} />
                  </div>
                    <div className="col-md-6">
                    <label className="form-label">Dirección</label>
                    <input className="form-control" name="address" value={bizForm.address} onChange={onBizInput} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Website</label>
                    <input className="form-control" name="website" value={bizForm.website} onChange={onBizInput} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Instagram</label>
                    <input className="form-control" name="instagram" value={bizForm.instagram} onChange={onBizInput} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Facebook</label>
                    <input className="form-control" name="facebook" value={bizForm.facebook} onChange={onBizInput} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Cover URL</label>
                    <input className="form-control" name="coverUrl" value={bizForm.coverUrl} onChange={onBizInput} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Servicios */}
          <div className="col-12">
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Servicios</h5>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => selectAll(true)}>Seleccionar todo</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => selectAll(false)}>Quitar todo</button>
                  <button className="btn btn-sm btn-primary" onClick={() => startEditService(null)}>+ Nuevo</button>
                </div>
              </div>

              <ul className="list-group mt-3">
                {(current.services || []).map(s => (
                  <li key={s.serviceId} className="list-group-item">
                    {editServiceId === s.serviceId ? (
                      // Form de edición del servicio
                      <div className="row g-2 align-items-end">
                        <div className="col-md-4">
                          <label className="form-label">Título</label>
                          <input className="form-control" name="title" value={svcForm.title} onChange={onSvcInput} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Descripción</label>
                          <input className="form-control" name="description" value={svcForm.description} onChange={onSvcInput} />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Precio</label>
                          <input type="number" className="form-control" name="price" value={svcForm.price} onChange={onSvcInput} />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Minutos</label>
                          <input type="number" className="form-control" name="durationMin" value={svcForm.durationMin} onChange={onSvcInput} />
                        </div>
                        <div className="col-12 d-flex gap-2 mt-2">
                          <button className="btn btn-success btn-sm" onClick={saveEditService}>Guardar</button>
                          <button className="btn btn-secondary btn-sm" onClick={cancelEditService}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      // Card normal del servicio
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">{s.title}</div>
                          <small className="text-muted">{s.description}</small>
                          <div className="small mt-1">{priceCR(s.price)} · {s.durationMin} min</div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={!!s.__selected}
                              onChange={() => toggleService(s.serviceId)}
                              title="Incluir al publicar"
                            />
                          </div>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => startEditService(s)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteService(s.serviceId)}>Eliminar</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}

                {/* Form de nuevo servicio */}
                {editServiceId === 'new' && (
                  <li className="list-group-item">
                    <div className="row g-2 align-items-end">
                      <div className="col-md-4">
                        <label className="form-label">Título</label>
                        <input className="form-control" name="title" value={svcForm.title} onChange={onSvcInput} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Descripción</label>
                        <input className="form-control" name="description" value={svcForm.description} onChange={onSvcInput} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Precio</label>
                        <input type="number" className="form-control" name="price" value={svcForm.price} onChange={onSvcInput} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Minutos</label>
                        <input type="number" className="form-control" name="durationMin" value={svcForm.durationMin} onChange={onSvcInput} />
                      </div>
                      <div className="col-12 d-flex gap-2 mt-2">
                        <button className="btn btn-success btn-sm" onClick={saveEditService}>Guardar</button>
                        <button className="btn btn-secondary btn-sm" onClick={cancelEditService}>Cancelar</button>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Publicar */}
          <div className="col-12">
            <button className="btn btn-primary" disabled={!canPublish || isPublishing} onClick={doPublish}>
              {isPublishing ? 'Publicando…' : 'Publicar'}
            </button>
            {!!msg && <span className="ms-3">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
