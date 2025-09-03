// src/pages/home.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

// Hero minimalista tipo startup
function Hero() {
  return (
    <div className="card border-0 mb-4" style={{
      background: 'radial-gradient(1200px 400px at 10% -20%, rgba(99,102,241,.25), transparent), radial-gradient(1200px 400px at 110% 120%, rgba(14,165,233,.25), transparent)',
      overflow: 'hidden'
    }}>
      <div className="p-4 p-md-5">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h1 className="mb-2">Crea sitios modernos <span className="brand-gradient">en minutos</span></h1>
            <p className="text-muted m-0">
              MiSitioFácil te permite generar páginas profesionales, conectar dominio y publicar con un clic.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link className="btn btn-brand" to="/create"><i className="bi bi-magic me-1" /> Crear página</Link>
            <Link className="btn btn-soft" to="/templates"><i className="bi bi-grid me-1" /> Ver plantillas</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [sites, setSites] = useState([])

  useEffect(() => {
    (async () => {
      const list = await api.listLocalSites()
      setSites(list)
    })()
  }, [])

  const createDemo = () => {
    const payload = {
      business: {
        slug: 'demo-barber',
        name: 'Barbería Aurora',
        category: 'Barbería',
        description: 'Cortes modernos y clásicos con atención premium.',
        phone: '+506 8888 0000',
        address: 'San Isidro, San Carlos',
        website: '',
        instagram: '',
        facebook: '',
        coverUrl: ''
      },
      services: [
        { serviceId: crypto.randomUUID(), title: 'Corte clásico', description: 'Tijera y máquina', price: 4500, durationMin: 30 }
      ]
    }
    localStorage.setItem('msf_site_demo-barber', JSON.stringify(payload))
    setSites(s => {
      const exist = s.some(x => x.slug === 'demo-barber')
      return exist ? s : [...s, { slug:'demo-barber', name:'Barbería Aurora', category:'Barbería', key:'msf_site_demo-barber' }]
    })
  }

  return (
    <div className="container-xxl">
      <Hero />

      <div className="card p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="text-muted">Modo demo: guarda contenido en tu navegador (localStorage).</div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-warning btn-sm" onClick={createDemo}>
              <i className="bi bi-lightning-charge me-1" /> Crear demo rápida
            </button>
            <Link className="btn btn-soft btn-sm" to="/preview">Vista previa</Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-3 border-bottom"><strong>Páginas existentes</strong></div>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle m-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Categoría</th>
                <th style={{width: 160}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sites.length === 0 && (
                <tr><td colSpan={4} className="text-muted p-4">Aún no hay páginas en este navegador.</td></tr>
              )}
              {sites.map(s => (
                <tr key={s.key}>
                  <td>{s.name}</td>
                  <td><code>{s.slug}</code></td>
                  <td>{s.category}</td>
                  <td className="d-flex gap-2">
                    <Link className="btn btn-brand btn-sm" to={`/site/${s.slug}`}>Ver pública</Link>
                    <Link className="btn btn-soft btn-sm" to="/builder">Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-muted small mt-4">
        © {new Date().getFullYear()} MiSitioFácil — Hecho con <span className="text-danger">❤</span>
      </div>
    </div>
  )
}
