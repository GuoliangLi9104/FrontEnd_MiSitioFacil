// /src/pages/TemplateSelector.jsx
import { useNavigate } from 'react-router-dom'
import { persist } from '../utils/persist'

const templates = [
  { id: 'template1', name: 'Minimalista Azul', thumb: '/templates/template1.jpg' },
  { id: 'template2', name: 'Verde Clásico', thumb: '/templates/template2.jpg' },
  { id: 'template3', name: 'Moderno Amarillo', thumb: '/templates/template3.jpg' },
]

export default function TemplateSelector() {
  const navigate = useNavigate()

  const selectTemplate = (id) => {
    const draft = persist.load() || {}
    draft.template = id
    persist.save(draft)
    navigate('/preview')
  }

  return (
    <div className="vstack gap-3">
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="m-0">Elige una plantilla</h4>
      </div>

      <div className="row g-3">
        {templates.map(t => (
          <div className="col-12 col-sm-6 col-lg-4" key={t.id}>
            <div className="card h-100 overflow-hidden">
              <div className="ratio ratio-16x9 bg-light">
                <img
                  src={t.thumb}
                  alt={t.name}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-3 d-flex justify-content-between align-items-center">
                <div className="fw-semibold">{t.name}</div>
                <button className="btn btn-brand btn-sm" onClick={() => selectTemplate(t.id)}>
                  Usar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
