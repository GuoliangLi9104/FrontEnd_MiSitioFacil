import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  const navigate = useNavigate()

  useEffect(()=>{
    // si ya hay token, mandamos al builder
    if (localStorage.getItem('token')) navigate('/builder', { replace: true })
  }, [navigate])

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const data = await api.login({ email, password })
      localStorage.setItem('token', data.token)
      navigate('/builder')
    } catch (error) {
      setErr(error.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card p-4">
          <h4 className="mb-2">Iniciar sesión</h4>
          <p className="text-muted">Accede a tu constructor de sitio y gestiona tus servicios.</p>
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={submit} className="vstack gap-3">
            <input
              className="form-control"
              type="email"
              placeholder="Correo"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
            />
            <input
              className="form-control"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              required
            />
            <button className="btn btn-brand" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
            <div className="text-muted small">
              ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
