// src/pages/login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      await api.login({ email, password })
      navigate('/') // al inicio
    } catch (err) {
      setMsg(err?.message || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-6 col-lg-5">
          <div className="card p-4 shadow-sm">
            <h3 className="mb-3">Iniciar sesión</h3>

            {msg && <div className="alert alert-danger">{msg}</div>}

            <form className="vstack gap-3" onSubmit={onSubmit}>
              <div>
                <input
                  type="email"
                  className="form-control"
                  placeholder="correo@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <div className="mt-3 text-muted">
              ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
