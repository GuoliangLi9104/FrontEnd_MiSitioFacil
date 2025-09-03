// src/pages/login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api.js'

export default function Login(){
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@demo.com')   // default demo
  const [password, setPassword] = useState('admin123')   // default demo
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const { user } = await api.login({ email, password })
      if (user?.role === 'admin') nav('/admin', { replace:true })
      else if (user?.role === 'owner') nav('/owner', { replace:true })
      else nav('/builder', { replace:true })
    } catch (e) {
      setErr(e.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const fillAdmin = () => { setEmail('admin@demo.com'); setPassword('admin123') }
  const fillOwner = () => { setEmail('owner@demo.com'); setPassword('owner123') }

  return (
    <div className="row justify-content-center">
      <div className="col-sm-10 col-md-6 col-lg-5">
        <div className="card p-4">
          <h3 className="mb-3">Iniciar sesión</h3>
          {err && <div className="alert alert-danger">{err}</div>}

          <form onSubmit={submit} className="vstack gap-3">
            <input className="form-control" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="form-control" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
          </form>

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-sm btn-outline-warning" onClick={fillAdmin}>Demo Admin</button>
            <button className="btn btn-sm btn-outline-success" onClick={fillOwner}>Demo Owner</button>
          </div>

          <div className="mt-3 text-muted">
            ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
