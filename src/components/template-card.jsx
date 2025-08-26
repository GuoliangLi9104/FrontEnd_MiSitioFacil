export default function TemplateCard({ tpl, selected, onSelect }) {
  return (
    <div className={`card h-100 ${selected ? 'border-info' : ''}`}>
      <img src={tpl.previewUrl} className="card-img-top" alt={tpl.name} />
      <div className="card-body">
        <h6 className="card-title d-flex justify-content-between align-items-center">
          {tpl.name}
          {selected && <span className="badge badge-template">Seleccionado</span>}
        </h6>
        <p className="card-text small">{tpl.description}</p>
        <button className="btn btn-sm btn-outline-info" onClick={() => onSelect(tpl)}>Elegir</button>
      </div>
    </div>
  )
}
