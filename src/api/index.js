// src/api/index.js
import { persist } from '../utils/persist'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function http(method, path, body) {
  const url = `${BASE_URL}${path}`
  const opt = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opt.body = JSON.stringify(body)
  const res = await fetch(url, opt)
  if (!res.ok) {
    const msg = await res.text().catch(()=>'')
    const err = new Error(msg || `HTTP ${res.status}`); err.status = res.status; throw err
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  // LECTURA: si hay backend intenta; si 404 o no hay, usa localStorage
  async getPublicSite(slug) {
    if (BASE_URL) {
      try { return await http('GET', `/sites/${encodeURIComponent(slug)}`) }
      catch (e) { if (!e.status || e.status !== 404) throw e }
    }
    const data = persist.loadForSlug(slug)
    if (!data || !data.business) { const err = new Error('Sitio no encontrado'); err.status = 404; throw err }
    return {
      business: {
        slug: data.business.slug || slug,
        name: data.business.name || 'Sitio sin nombre',
        category: data.business.category || '',
        description: data.business.description || '',
        phone: data.business.phone || '',
        address: data.business.address || '',
        website: data.business.website || '',
        instagram: data.business.instagram || '',
        facebook: data.business.facebook || '',
        coverUrl: data.business.coverUrl || ''
      },
      services: Array.isArray(data.services) ? data.services : []
    }
  },

  // UPSERT: si no hay backend, guarda local y avisa
  async upsertSite(payload) {
    const slug = payload?.business?.slug
    if (!slug) throw new Error('Falta business.slug')
    if (!BASE_URL) { persist.saveForSlug(slug, payload); return { ok:true, source:'local' } }
    return http('POST', '/sites', payload)
  },

  // Publica lo de localStorage (si no hay backend, simplemente guarda local)
  async publishFromLocal(slug) {
    const data = persist.loadForSlug(slug)
    if (!data) throw new Error(`No hay datos locales para el slug "${slug}"`)
    return this.upsertSite(data)
  },

  async listLocalSites() { return persist.listSites() },

  // ==== ALIAS LEGACY (evita "api.getPublicSite is not a function") ====
  async getBusinessBySlug(slug) { return this.getPublicSite(slug) },
}
export * from '../api.js';

// export named y default
export default api
if (typeof window !== 'undefined') window.__api = api
