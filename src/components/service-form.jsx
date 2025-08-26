import { useState } from 'react'

export default function ServiceForm({ services, onSave, onDelete }) {
  const [form, setForm] = useState({ title: '', description: '', price: 0, durationMin: 30 })
  const [editingId, setEditingId] = useState(null)

  const startEdit = s => {
    setEditingId(s.serviceId || s.id)
    setForm({ title: s.title, description: s.description || '', price: s.price, durationMin: s.durationMin })
  }

  const submit = e => {
    e.preventDefault()
    onSave({ ...form, serviceId: editingId || undefined })
    setForm({ title: '', description: '', price: 0, durationMin: 30 })
    setEditingId(null)
  }

  return (
    <div className="card p-3">
      <form onSubmit={submit} className="row g-2">
        <div className="col-md-4">
          <label className="form-label">Servicio</label>
          <input className="form-control" value={form.title}
                 onChange={e=>setForm({...form, title:e.target.value})} required />
        </div>
        <div className="col-md-4">
          <label className="form-label">Descripción</label>
          <input className="form-control" value={form.description}
                 onChange={e=>setForm({...form, description:e.target.value})}/>
        </div>
        <div className="col-md-2">
          <label className="form-label">Precio</label>
          <input type="number" min="0" step="0.01" className="form-control" value={form.price}
                 onChange={e=>setForm({...form, price:parseFloat(e.target.value)})} required />
        </div>
        <div className="col-md-2">
          <label className="form-label">Duración (min)</label>
          <input type="number" min="5" step="5" className="form-control" value={form.durationMin}
                 onChange={e=>setForm({...form, durationMin:parseInt(e.target.value)})} required />
        </div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-info">{editingId ? 'Actualizar' : 'Agregar'}</button>
          {editingId && <button type="button" className="btn btn-secondary" onClick={()=>{setEditingId(null); setForm({title:'',description:'',price:0,durationMin:30})}}>Cancelar</button>}
        </div>
      </form>

      <hr />
      <ul className="list-group">
        {services.map(s => (
          <li key={s.serviceId || s.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{s.title}</strong> · {s.durationMin} min · ₡{Number(s.price).toFixed(2)}
              {s.description ? <div className="small text-muted">{s.description}</div> : null}
            </div>
            <div className="btn-group">
              <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(s)}>Editar</button>
              <button className="btn btn-sm btn-outline-danger" onClick={()=>onDelete(s.serviceId || s.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
