// src/pages/schedule.jsx
import { Link } from 'react-router-dom'
import ScheduleEditor from '../components/ScheduleEditor.jsx'

export default function SchedulePage() {
  return (
    <div className="vstack gap-3">
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="m-0">Horario</h4>
        <Link className="btn btn-soft btn-sm" to="/preview">
          <i className="bi bi-eye me-1" /> Ver vista previa
        </Link>
      </div>
      <ScheduleEditor />
    </div>
  )
}
