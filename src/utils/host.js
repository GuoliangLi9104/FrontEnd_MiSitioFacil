// src/utils/host.js
export function getBaseHost() {
  const envHost = (import.meta.env.VITE_PUBLIC_BASE_HOST || '').trim()
  if (envHost) return envHost.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const host = window.location.hostname
  if (host === 'localhost') return 'localhost'
  const parts = host.split('.'); return parts.length >= 3 ? parts.slice(-2).join('.') : host
}
export function buildPublicUrl(slug) {
  const proto = window.location.protocol === 'http:' ? 'http:' : 'https:'
  const base = getBaseHost()
  if (base === 'localhost') {
    const port = window.location.port ? `:${window.location.port}` : ''
    return `${proto}//${window.location.hostname}${port}/site/${encodeURIComponent(slug)}`
  }
  return `${proto}//${encodeURIComponent(slug)}.${base}/`
}
