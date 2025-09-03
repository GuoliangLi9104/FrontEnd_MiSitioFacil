// src/components/BackendStatus.jsx
import { useEffect, useState } from 'react'
import { api, BACKEND_CONFIGURED } from '../api'

export default function BackendStatus() {
  const [status, setStatus] = useState({ loading: true, ok: false, msg: '' })

  useEffect(() => {
    let mounted = true
    async function run() {
      if (!BACKEND_CONFIGURED) {
        mounted && setStatus({ loading:false, ok:false, msg:'Backend no configurado' })
        return
      }
      const r = await api.ping()
      if (!mounted) return
      if (r.ok && r.backend) setStatus({ loading:false, ok:true, msg:'Conectado al backend' })
      else setStatus({ loading:false, ok:false, msg:r.message || 'Sin conexión al backend' })
    }
    run()
    return () => { mounted = false }
  }, [])

  if (status.loading) return null

  return (
    <div
      className={`my-2 rounded px-3 py-2 text-sm ${status.ok
        ? 'bg-green-100 border border-green-300 text-green-800'
        : 'bg-red-100 border border-red-300 text-red-800'
      }`}
      role="status"
      aria-live="polite"
    >
      {status.ok ? '✅ ' : '⚠️ '}{status.msg}
    </div>
  )
}
