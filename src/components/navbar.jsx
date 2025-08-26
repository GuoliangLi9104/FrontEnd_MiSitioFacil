import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('ownerBusiness')
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/"><span className="brand-gradient">MiSitioFácil</span></Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navc">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div id="navc" className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            {token && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/builder">Constructor</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/preview">Vista previa</NavLink></li>
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {!token ? (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/login">Entrar</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/register">Registro</NavLink></li>
              </>
            ) : (
              <li className="nav-item">
                <button onClick={logout} className="btn btn-outline-light btn-sm">Salir</button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
