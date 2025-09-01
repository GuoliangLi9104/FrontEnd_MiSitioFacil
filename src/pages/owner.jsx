// src/pages/owner.jsx
import { useEffect, useState } from 'react'
import RoleRoute from '../components/RoleRoute.jsx'
import { getAuthInfo } from '../utils/auth'
import { api } from '../api'

export default function OwnerPage(){
  return (
    <RoleRoute allow={['owner']}>
      <OwnerDashboard />
    </RoleRoute>
  )
}

function OwnerDashboard(){
  const { businessId } = getAuthInfo()
  const [biz, setBiz] = useState(null)
  const [services, setServices] = useState([])
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('biz')
  const [svcForm, setSvcForm] = useState({ title:'', description:'', price:0, durationMin:30 })
  const [editId, setEditId] = useState(null)

  useEffect(()=>{
    (async()=>{
      try{
        const all = await api.adminListBusinesses()
        const b = (all.items||[]).find(x => (x.id||x._id) === businessId)
        setBiz(b || null)
        const sv = await api.listServices(businessId)
        setServices(sv || [])
      }catch(e){ setErr(e.message||'Error cargando'); }
    })()
  },[businessId])

  const saveBiz = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const patch = { name: biz.name, slug: biz.slug, category: biz.category, description: biz.description, phone: biz.phone, address: biz.address }
      const r = await api.updateBusiness(businessId, patch)
      setBiz({ ...biz, ...r })
    } catch(e){ setErr(e.message||'Error guardando negocio') }
    finally { setSaving(false) }
  }

  const submitService = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        const upd = await api.updateService(editId, { ...svcForm, businessId })
        setServices(s => s.map(x => (x.id===editId||x.serviceId===editId) ? { ...x, ...upd } : x))
        setEditId(null)
      } else {
        const created = await api.createService(businessId, svcForm)
        setServices(s => [...s, { id: created.id || created._id, ...svcForm }])
      }
      setSvcForm({ title:'', description:'', price:0, durationMin:30 })
    } catch(e){ setErr(e.message||'Error guardando servicio') }
  }

  const editService = (s) => {
    setEditId(s.id || s.serviceId)
    setSvcForm({ title: s.title, description: s.description, price: s.price, durationMin: s.durationMin })
  }
  const removeService = async (s) => {
    const id = s.id || s.serviceId
    await api.deleteService(id, businessId)
    setServices(x => x.filter(y => (y.id||y.serviceId)!==id))
  }

  if (err) return <div className="alert alert-danger m-3">{err}</div>
  if (!biz) return <div className="p-4">Cargando…</div>

  return (
    <div className="container py-3">
      <h3 className="mb-3">Mi Página</h3>

      <div className="btn-group mb-3">
        <button className={`btn btn-sm ${tab==='biz'?'btn-primary':'btn-outline-primary'}`} onClick={()=>setTab('biz')}>Datos del negocio</button>
        <button className={`btn btn-sm ${tab==='svc'?'btn-primary':'btn-outline-primary'}`} onClick={()=>setTab('svc')}>Servicios</button>
      </div>

      {tab==='biz' && (
        <form className="card p-3" onSubmit={saveBiz}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={biz.name||''} onChange={e=>setBiz({...biz, name:e.target.value})} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Slug</label>
              <input className="form-control" value={biz.slug||''} onChange={e=>setBiz({...biz, slug:e.target.value})} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Categoría</label>
              <input className="form-control" value={biz.category||''} onChange={e=>setBiz({...biz, category:e.target.value})} />
            </div>
            <div className="col-12">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows={3} value={biz.description||''} onChange={e=>setBiz({...biz, description:e.target.value})} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Teléfono</label>
              <input className="form-control" value={biz.phone||''} onChange={e=>setBiz({...biz, phone:e.target.value})} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Dirección</label>
              <input className="form-control" value={biz.address||''} onChange={e=>setBiz({...biz, address:e.target.value})} />
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary" disabled={saving}>{saving?'Guardando…':'Guardar cambios'}</button>
          </div>
        </form>
      )}

      {tab==='svc' && (
        <div className="card p-3">
          <form className="row g-2" onSubmit={submitService}>
            <div className="col-md-3"><input className="form-control" placeholder="Título" value={svcForm.title} onChange={e=>setSvcForm({...svcForm,title:e.target.value})} required /></div>
            <div className="col-md-3"><input className="form-control" placeholder="Descripción" value={svcForm.description} onChange={e=>setSvcForm({...svcForm,description:e.target.value})} /></div>
            <div className="col-md-2"><input type="number" className="form-control" placeholder="Precio" value={svcForm.price} onChange={e=>setSvcForm({...svcForm,price:Number(e.target.value)})} /></div>
            <div className="col-md-2"><input type="number" className="form-control" placeholder="Minutos" value={svcForm.durationMin} onChange={e=>setSvcForm({...svcForm,durationMin:Number(e.target.value)})} /></div>
            <div className="col-md-2"><button className="btn btn-success w-100">{editId?'Actualizar':'Agregar'}</button></div>
          </form>

          <div className="table-responsive mt-3">
            <table className="table table-sm align-middle">
              <thead><tr><th>Título</th><th>Precio</th><th>Duración</th><th></th></tr></thead>
              <tbody>
                {services.map(s=>(
                  <tr key={s.id||s.serviceId}>
                    <td>{s.title}</td>
                    <td>₡{Number(s.price||0).toFixed(0)}</td>
                    <td>{s.durationMin} min</td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={()=>editService(s)}>Editar</button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>removeService(s)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {services.length===0 && <tr><td colSpan={4} className="text-muted">Sin servicios</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
