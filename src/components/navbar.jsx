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
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <i className="bi bi-stars"></i>
          <span className="brand-gradient">MiSitioFácil</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div id="mainNav" className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><NavLink className="nav-link" to="/">Inicio</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/site/demo">Demo</NavLink></li>
            {token && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/builder">Constructor</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/preview">Vista previa</NavLink></li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto">
            {!token ? (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/login">Entrar</NavLink></li>
                <li className="nav-item">
                  <NavLink className="btn btn-brand btn-sm ms-lg-2" to="/register">
                    Crear cuenta
                  </NavLink>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button onClick={logout} className="btn btn-soft btn-sm">
                  <i className="bi bi-box-arrow-right me-1"></i> Salir
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
