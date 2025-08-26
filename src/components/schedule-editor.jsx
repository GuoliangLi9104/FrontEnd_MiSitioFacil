import { useState } from 'react'
const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export default function ScheduleEditor({ onSave }) {
  const [dayOfWeek, setDay] = useState(1)
  const [startTime, setStart] = useState('08:00')
  const [endTime, setEnd]   = useState('17:00')

  const submit = e => {
    e.preventDefault()
    onSave({ dayOfWeek: Number(dayOfWeek), startTime, endTime })
  }

  return (
    <form className="card p-3 mb-3" onSubmit={submit}>
      <div className="row g-2">
        <div className="col-md-4">
          <label className="form-label">Día</label>
          <select className="form-select" value={dayOfWeek} onChange={e=>setDay(e.target.value)}>
            {days.map((d,ix)=><option key={ix} value={ix}>{d}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Inicio</label>
          <input type="time" className="form-control" value={startTime} onChange={e=>setStart(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Fin</label>
          <input type="time" className="form-control" value={endTime} onChange={e=>setEnd(e.target.value)} />
        </div>
        <div className="col-md-2 d-grid">
          <label className="form-label">&nbsp;</label>
          <button className="btn btn-outline-info">Guardar</button>
        </div>
      </div>
    </form>
  )
}
