// src/pages/TenantRouter.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TenantRouter() {
  const nav = useNavigate()
  useEffect(() => {
    const host = window.location.hostname
    const isLocal = host === 'localhost' || host === '127.0.0.1'
    if (isLocal) return
    // <slug>.misitiofacil.org → /site/:slug
    const parts = host.split('.')
    if (parts.length >= 3) {
      const slug = parts[0]
      if (slug && slug !== 'www' && slug !== 'app') {
        nav(`/site/${slug}`, { replace: true })
      }
    }
  }, [nav])
  return null
}
