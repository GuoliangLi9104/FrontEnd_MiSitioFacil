// src/pages/builder.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import debounce from 'lodash.debounce'
import { persist } from '../utils/persist'
import ImagePicker from '../components/ImagePicker'

const empty = {
  business: {
    slug: 'demo',
    name: '',
    category: '',
    description: '',
    phone: '',
    address: '',
    website: '',
    instagram: '',
    facebook: '',
    coverUrl: ''      // <- aquí guardamos la dataURL de portada
  },
  services: []
}

export default function Builder() {
  const [model, setModel] = useState(empty)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    const draft = persist.load()
    if (draft) setModel(draft)
  }, [])

  const autoSave = useMemo(
    () => debounce((next) => { persist.save(next); setSavedAt(new Date()) }, 350),
    []
  )

  const setModelAndSave = (updater) => {
    setModel(prev => {
      const next = structuredClone(prev)
      updater(next)
      autoSave(next)
      return next
    })
  }

  const update = (path, value) => {
    setModelAndSave((next) => {
      const parts = path.split('.')
      let ref = next
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]]
      ref[parts.at(-1)] = value
    })
  }

  const addService = () => {
    setModelAndSave((next) => {
      next.services.push({
        serviceId: crypto.randomUUID(),
        title: '',
        description: '',
        price: 0,
        durationMin: 30,
        imageUrl: ''     // <- imagen opcional por servicio
      })
    })
  }

  const updateService = (id, field, value) => {
    setModelAndSave((next) => {
      const it = next.services.find(s => s.serviceId === id)
      if (it) it[field] = value
    })
  }

  const removeService = (id) => {
    setModelAndSave((next) => {
      next.services = next.services.filter(s => s.serviceId !== id)
    })
  }

  const clearAll = () => {
    persist.clear()
    setModel(empty)
    setSavedAt(null)
  }

  const { business, services } = model

  return (
    <div className="vstack gap-3">
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="m-0">Constructor</h4>
        <div className="d-flex align-items-center gap-2">
          <div className="small text-muted">
            {savedAt ? `Guardado: ${savedAt.toLocaleTimeString()}` : '—'}
          </div>
          <Link to="/preview" className="btn btn-brand btn-sm">
            <i className="bi bi-eye me-1" /> Ver vista previa
          </Link>
          <button onClick={clearAll} className="btn btn-soft btn-sm">
            <i className="bi bi-trash3 me-1" /> Limpiar borrador
          </button>
        </div>
      </div>

      {/* Datos del negocio */}
      <div className="card p-3">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Slug (subdominio)</label>
            <input
              className="form-control"
              value={business.slug}
              onChange={(e) => update('business.slug', e.target.value.trim().toLowerCase())}
              placeholder="ej. barberiaeclipse"
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Nombre del negocio</label>
            <input
              className="form-control"
              value={business.name}
              onChange={(e) => update('business.name', e.target.value)}
              placeholder="Mi negocio profesional"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Categoría</label>
            <input
              className="form-control"
              value={business.category}
              onChange={(e) => update('business.category', e.target.value)}
              placeholder="Barbería, Repostería, etc."
            />
          </div>

          <div className="col-12">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              rows={3}
              value={business.description}
              onChange={(e) => update('business.description', e.target.value)}
              placeholder="Describe tu propuesta de valor…"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">WhatsApp / Teléfono</label>
            <input
              className="form-control"
              value={business.phone}
              onChange={(e) => update('business.phone', e.target.value)}
              placeholder="+506 8888 0000"
            />
          </div>
          <div className="col-md-8">
            <label className="form-label">Dirección</label>
            <input
              className="form-control"
              value={business.address}
              onChange={(e) => update('business.address', e.target.value)}
              placeholder="Dirección pública"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Website</label>
            <input
              className="form-control"
              value={business.website}
              onChange={(e) => update('business.website', e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Instagram</label>
            <input
              className="form-control"
              value={business.instagram}
              onChange={(e) => update('business.instagram', e.target.value)}
              placeholder="https://instagram.com/…"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Facebook</label>
            <input
              className="form-control"
              value={business.facebook}
              onChange={(e) => update('business.facebook', e.target.value)}
              placeholder="https://facebook.com/…"
            />
          </div>

          {/* Subir imagen de portada */}
          <div className="col-12">
            <ImagePicker
              label="Imagen de portada"
              value={business.coverUrl}
              onChange={(val) => update('business.coverUrl', val)}
            />
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">Servicios</h5>
          <button onClick={addService} className="btn btn-brand btn-sm">
            <i className="bi bi-plus-lg me-1" /> Agregar servicio
          </button>
        </div>

        {services.length === 0 && (
          <div className="text-muted">Aún no has agregado servicios.</div>
        )}

        <div className="row g-3">
          {services.map((s) => (
            <div className="col-12" key={s.serviceId}>
              <div className="card p-3">
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label">Título</label>
                    <input
                      className="form-control"
                      value={s.title}
                      onChange={(e) => updateService(s.serviceId, 'title', e.target.value)}
                      placeholder="Corte clásico"
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">Descripción</label>
                    <input
                      className="form-control"
                      value={s.description}
                      onChange={(e) => updateService(s.serviceId, 'description', e.target.value)}
                      placeholder="Detalle breve"
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Precio (₡)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={s.price}
                      onChange={(e) => updateService(s.serviceId, 'price', Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Min</label>
                    <input
                      type="number"
                      className="form-control"
                      value={s.durationMin}
                      onChange={(e) => updateService(s.serviceId, 'durationMin', Number(e.target.value))}
                      min={5}
                    />
                  </div>

                  {/* Imagen por servicio (opcional) */}
                  <div className="col-12">
                    <ImagePicker
                      label="Imagen del servicio (opcional)"
                      value={s.imageUrl}
                      onChange={(val) => updateService(s.serviceId, 'imageUrl', val)}
                      maxW={1200}
                      maxH={800}
                      maxMB={4}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-2">
                  <button onClick={() => removeService(s.serviceId)} className="btn btn-soft btn-sm">
                    <i className="bi bi-trash me-1" /> Quitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="small text-muted">
        Consejo: sube tu imagen de portada, agrega servicios y abre <strong>Vista previa</strong>; no se perderá nada.
      </div>
    </div>
  )
}
