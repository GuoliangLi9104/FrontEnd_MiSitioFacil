export default function Footer(){
  return (
    <footer className="site-footer py-4 mt-5">
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
        <div className="small text-muted">
          © {new Date().getFullYear()} MiSitioFácil — Hecho con ❤️
        </div>
        <div className="small">
          <a className="text-muted text-decoration-none me-3" href="#">Privacidad</a>
          <a className="text-muted text-decoration-none" href="#">Términos</a>
        </div>
      </div>
    </footer>
  )
}
