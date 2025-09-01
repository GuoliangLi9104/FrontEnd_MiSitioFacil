// src/components/ScheduleEditor.jsx
import { useEffect, useState } from 'react'
import { DAY_KEYS, DAY_LABELS, makeEmptySchedule } from '../utils/schedule'
import { persist } from '../utils/persist'

function DayRow({ label, intervals, onChange }) {
  const add = () => onChange([...(intervals || []), { open: '08:00', close: '17:00' }])
  const remove = (i) => onChange((intervals || []).filter((_, idx) => idx !== i))
  const upd = (i, k, v) => onChange((intervals || []).map((iv, idx) => (idx === i ? { ...iv, [k]: v } : iv)))
  const clear = () => onChange([])

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="fw-semibold">{label}</div>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-soft btn-sm" onClick={add}>
            <i className="bi bi-plus-lg me-1" /> Añadir franja
          </button>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={clear}>
            <i className="bi bi-x-circle me-1" /> Cerrar día
          </button>
        </div>
      </div>

      {(!intervals || intervals.length === 0) && <div className="text-muted small">Cerrado</div>}

      {(intervals || []).map((iv, i) => (
        <div key={i} className="d-flex align-items-center gap-2 mb-2">
          <div className="input-group" style={{ maxWidth: 280 }}>
            <span className="input-group-text">Abre</span>
            <input type="time" className="form-control" value={iv.open} onChange={(e) => upd(i, 'open', e.target.value)} />
            <span className="input-group-text">Cierra</span>
            <input type="time" className="form-control" value={iv.close} onChange={(e) => upd(i, 'close', e.target.value)} />
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => remove(i)}>
            <i className="bi bi-trash" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function ScheduleEditor() {
  const [draft, setDraft] = useState(null)
  const [schedule, setSchedule] = useState(makeEmptySchedule())

  useEffect(() => {
    const d = persist.load() || {}
    setDraft(d)
    setSchedule(d?.schedule && d.schedule.days ? d.schedule : makeEmptySchedule())
  }, [])

  const save = () => {
    const d = persist.load() || {}
    d.schedule = schedule
    persist.save(d)
    alert('Horario guardado ✅')
  }

  // presets
  const wk = (list) => ({ mon: list, tue: list, wed: list, thu: list, fri: list })
  const setPreset = (type) => {
    if (type === '8a5') {
      setSchedule((s) => ({ ...s, days: { ...s.days, ...wk([{ open: '08:00', close: '12:00' }, { open: '13:00', close: '17:00' }]) } }))
    }
    if (type === '6med') {
      setSchedule((s) => ({ ...s, days: { ...s.days, sat: [{ open: '09:00', close: '13:00' }] } }))
    }
    if (type === '7cerrado') {
      setSchedule((s) => ({ ...s, days: { ...s.days, sun: [] } }))
    }
  }

  if (!draft) return <div className="card p-4">Cargando…</div>

  return (
    <div className="vstack gap-3">
      <div className="card p-3">
        <div className="row g-2 align-items-end">
          <div className="col-auto">
            <label className="form-label">Zona horaria (opcional)</label>
            <input
              className="form-control"
              placeholder="America/Costa_Rica"
              value={schedule.timezone || ''}
              onChange={(e) => setSchedule((s) => ({ ...s, timezone: e.target.value }))}
              style={{ width: 220 }}
            />
          </div>
          <div className="col d-flex gap-2">
            <button className="btn btn-soft btn-sm" onClick={() => setPreset('8a5')}>Lun–Vie 08–12 / 13–17</button>
            <button className="btn btn-soft btn-sm" onClick={() => setPreset('6med')}>Sáb 09–13</button>
            <button className="btn btn-soft btn-sm" onClick={() => setPreset('7cerrado')}>Dom cerrado</button>
            <div className="ms-auto">
              <button className="btn btn-brand btn-sm" onClick={save}>
                <i className="bi bi-save me-1" /> Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-3">
        {DAY_KEYS.map((k) => (
          <DayRow
            key={k}
            label={DAY_LABELS[k]}
            intervals={schedule.days[k]}
            onChange={(list) => setSchedule((s) => ({ ...s, days: { ...s.days, [k]: list } }))}
          />
        ))}
      </div>
    </div>
  )
}
