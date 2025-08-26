import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Register(){
  const [fullName,setFullName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const data = await api.register({ fullName, email, password })
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
      <div className="col-md-6">
        <div className="card p-4">
          <h4 className="mb-3">Registro</h4>
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={submit} className="row g-2">
            <div className="col-md-6">
              <input className="form-control" placeholder="Nombre completo" value={fullName}
                     onChange={e=>setFullName(e.target.value)} required />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Correo" value={email}
                     onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="col-md-12">
              <input type="password" className="form-control" placeholder="Contraseña"
                     value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <div className="col-12">
              <button className="btn btn-info" disabled={loading}>{loading?'Creando...':'Crear cuenta'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
