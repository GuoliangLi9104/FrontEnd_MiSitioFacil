// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { getAuthInfo } from '../utils/auth'

export default function ProtectedRoute({ children }) {
  const { token, role } = getAuthInfo()
  if (!token || role === 'client') return <Navigate to="/login" replace />
  return children
}
