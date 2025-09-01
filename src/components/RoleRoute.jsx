// src/components/RoleRoute.jsx
import { Navigate } from 'react-router-dom'
import { getAuthInfo } from '../utils/auth'

export default function RoleRoute({ allow = [], children }) {
  const { role } = getAuthInfo()
  if (allow.length && !allow.includes(role)) return <h4 className="m-4">403 — Sin permisos</h4>
  return children
}
