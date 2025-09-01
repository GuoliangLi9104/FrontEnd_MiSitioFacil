// src/pages/create.jsx
import { useState } from 'react'
import { api } from '../api'
import { devLoginAs, setOwnerBusinessId } from '../utils/auth'

export default function CreatePage(){
  const [form, setForm] = useState({
    name: '', slug: '', category: '', description: '',
    phone: '', address: ''
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      if (!form.name || !form.slug) { setMsg('Nombre y slug son obligatorios'); setLoading(false); return }
      const created = await api.createBusiness(form)
      const businessId = created.id || created._id || created.businessId
      if (businessId) { setOwnerBusinessId(businessId); devLoginAs('owner', { businessId }) }
      setMsg('Página creada. Ahora puedes editarla en “Mi Página”.')
    } catch (e) { setMsg(e.message || 'Error creando página') }
    finally { setLoading(false) }
  }

  return (
    <div className="container py-3">
      <h3 className="mb-3">Crear Página</h3>
      {msg && <div className="alert alert-info">{msg}</div>}

      <form className="vstack gap-3" onSubmit={submit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombre del negocio</label>
            <input name="name" className="form-control" value={form.name} onChange={onChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Slug (URL)</label>
            <input name="slug" className="form-control" value={form.slug} onChange={onChange} placeholder="mi-negocio" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Categoría</label>
            <input name="category" className="form-control" value={form.category} onChange={onChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input name="phone" className="form-control" value={form.phone} onChange={onChange} />
          </div>
          <div className="col-12">
            <label className="form-label">Dirección</label>
            <input name="address" className="form-control" value={form.address} onChange={onChange} />
          </div>
          <div className="col-12">
            <label className="form-label">Descripción</label>
            <textarea name="description" className="form-control" rows="3" value={form.description} onChange={onChange} />
          </div>
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Creando…' : 'Crear página'}
        </button>
      </form>
    </div>
  )
}
