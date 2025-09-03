// src/components/PublishButton.jsx
import { useState } from 'react'
import { api } from '../api.js'
import { buildPublicUrl } from '../utils/host'

export default function PublishButton({ slug, openAfter = true, className = '' }) {
  const [status, setStatus] = useState('idle') // idle | loading | ok | error
  const [msg, setMsg] = useState('')

  const handlePublish = async () => {
    if (!slug) { setStatus('error'); setMsg('Falta slug'); return }
    setStatus('loading'); setMsg('')
    try {
      const res = await api.publishSelection(slug) // → POST /api/templates/publish
      setStatus('ok')
      setMsg(res?.source === 'local' ? 'Guardado local.' : 'Publicado en backend.')
      if (openAfter) {
        const url = buildPublicUrl(slug)
        // ligera espera por si hay navegación interna
        setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), 150)
      }
    } catch (e) {
      setStatus('error'); setMsg(e?.message || 'Error al publicar')
    }
  }

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <button className="btn btn-brand btn-sm" onClick={handlePublish} disabled={status === 'loading'}>
        {status === 'loading' ? 'Publicando…' : 'Publicar página'}
      </button>
      {msg && <span className={`small ${status === 'error' ? 'text-danger' : 'text-muted'}`}>{msg}</span>}
    </div>
  )
}
