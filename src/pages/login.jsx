import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const data = await api.login({ email, password })
      localStorage.setItem('token', data.token)
      navigate('/builder')
    } catch (error) {
      setErr(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card p-4">
          <h4 className="mb-3">Iniciar sesión</h4>
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={submit} className="vstack gap-3">
            <input className="form-control" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input type="password" className="form-control" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required />
            <button className="btn btn-info" disabled={loading}>{loading?'Entrando...':'Entrar'}</button>
          </form>
          <div className="mt-3">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
