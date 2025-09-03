// src/api.js
// API local + backend compatible: auth, business, publicación, servicios, reservas, edición de borrador.

import { devstore } from './utils/devstore'
import { getAuthInfo, setAuthInfo } from './utils/auth'

// ------- Config -------
const FORCE_DEMO = import.meta.env.VITE_FORCE_DEMO === '1'

const IS_LOCAL = typeof window !== 'undefined' && window.location?.host?.includes('localhost:5173')
const RAW_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const BASE = IS_LOCAL ? '/api' : (RAW_BASE || '/api')

export const BACKEND_CONFIGURED = !!BASE && !FORCE_DEMO

const norm = s => String(s || '').trim().toLowerCase()

// ------- HTTP -------
function buildUrl(base, path) {
  if (!path || path === '/') return base
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * http(path, { method='GET', body, headers, auth=false })
 * - En GET/HEAD sin body: NO agrega Content-Type ni Authorization (evita preflight)
 * - Si necesitas token en GET, pasa { auth:true }
 */
async function http(path, { method = 'GET', body, headers, auth = false } = {}) {
  if (!BACKEND_CONFIGURED) throw new Error('Backend no configurado')
  const url = buildUrl(BASE, (path || '').trim())

  const hasBody = body != null
  const methodUpper = String(method || 'GET').toUpperCase()
  const isSimple = (methodUpper === 'GET' || methodUpper === 'HEAD') && !hasBody

  const baseHeaders = { ...(headers || {}) }

  if (!isSimple) {
    baseHeaders['Content-Type'] = baseHeaders['Content-Type'] || 'application/json'
  }

  const { token } = getAuthInfo() || {}
  if ((auth || !isSimple) && token) {
    baseHeaders['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    method: methodUpper,
    headers: baseHeaders,
    body: hasBody ? JSON.stringify(body) : undefined
  })

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const dj = await res.json(); msg = dj.message || dj.error || msg } catch {}
    throw new Error(msg)
  }
  try { return await res.json() } catch { return {} }
}

// ------- LocalStorage keys -------
const draftKey    = slug => `msf_site_${norm(slug)}`
const pubKey      = slug => `msf_pub_${norm(slug)}`
const bookingsKey = slug => `msf_bookings_${norm(slug)}`
const bizIdxKey   = 'msf_business_index' // índice simple de negocios en DEMO

// ------- Helpers -------
function _normalizeSite(obj, slugFallback='') {
  const business = obj?.business || {}
  const services = Array.isArray(obj?.services) ? obj.services : []
  return {
    business: {
      slug: norm(business.slug || slugFallback),
      name: business.name || 'Sitio sin nombre',
      category: business.category || '',
      description: business.description || '',
      phone: business.phone || '',
      address: business.address || '',
      website: business.website || '',
      instagram: business.instagram || '',
      facebook: business.facebook || '',
      coverUrl: business.coverUrl || ''
    },
    services: services.map(s => ({
      serviceId: s.serviceId || s.id || (crypto?.randomUUID ? crypto.randomUUID() : String(Math.random())),
      title: s.title || s.name || '',
      description: s.description || '',
      price: Number(s.price || 0),
      durationMin: Number(s.durationMin || s.duration || 30),
      __selected: !!(s.__selected ?? s.selected)
    }))
  }
}

function loadDraft(slug){
  try { const raw = localStorage.getItem(draftKey(slug)); if (!raw) return null; return _normalizeSite(JSON.parse(raw), slug) }
  catch { return null }
}
function saveDraftLocal(slug, draft) { localStorage.setItem(draftKey(slug), JSON.stringify(draft)) }
function savePublished(slug, payload){ localStorage.setItem(pubKey(slug), JSON.stringify(payload)) }
function loadPublished(slug){
  try { const raw = localStorage.getItem(pubKey(slug)); if (!raw) return null; return _normalizeSite(JSON.parse(raw), slug) }
  catch { return null }
}
function saveBookingLocal(slug, booking) {
  const key = bookingsKey(slug)
  const list = JSON.parse(localStorage.getItem(key) || '[]')
  list.push(booking)
  localStorage.setItem(key, JSON.stringify(list))
}
function listLocalSites(){
  const items = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith('msf_site_')) continue
    try {
      const obj = JSON.parse(localStorage.getItem(k) || '{}')
      const slug = obj?.business?.slug || k.replace('msf_site_', '')
      items.push({ slug: norm(slug), name: obj?.business?.name || slug, category: obj?.business?.category || '', key: k })
    } catch {
      const slug = k.replace('msf_site_', '')
      items.push({ slug: norm(slug), name: slug, category: '', key: k })
    }
  }
  return items
}

const pick = (obj, keys) => { const out = {}; for (const k of keys) out[k] = obj?.[k] ?? ''; return out }
const filterServicesRespectingSelection = (services=[]) =>
  services.some(s=>!!s.__selected) ? services.filter(s=>!!s.__selected) : services

// ===================================================
export const api = {
  // ---------- AUTH ----------
  async register({ name, fullName, email, password }) {
  const realName = name || fullName || (email ? email.split('@')[0] : 'Usuario')
  try {
    const rsp = await http('/auth/register', {
      method: 'POST',
      body: { name: realName, email, password },
      auth: false
    })

    const token = rsp?.token ?? rsp?.data?.token
    const backendUser = rsp?.user ?? rsp?.data?.user
    if (!token) throw new Error(rsp?.error || rsp?.message || 'Registro inválido (sin token)')

    const user = backendUser || { name: realName, email, role: 'owner' }
    setAuthInfo(token, user)
    return { ok: true, token, user, source: 'backend' }
  } catch (e) {
    const msg = String(e?.message || e || '')
    // 🔁 Fallback local si el backend no está listo
    if (/database not configured|service unavailable|503/i.test(msg)) {
      const token = `demo.${btoa(email)}.${Date.now()}`
      const user = { name: realName, email, role: 'owner', _warning: 'fallback-local' }
      setAuthInfo(token, user)
      return { ok: true, token, user, source: 'fallback' }
    }
    throw e
  }
},

async login({ email, password }) {
  try {
    const rsp = await http('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false
    })

    const token = rsp?.token ?? rsp?.data?.token
    const backendUser = rsp?.user ?? rsp?.data?.user
    if (!token) throw new Error(rsp?.error || rsp?.message || 'Login inválido (sin token)')

    const role = backendUser?.role || 'owner'
    const user = { ...(backendUser || { email }), role }
    setAuthInfo(token, user)
    return { ok: true, token, user, source: 'backend' }
  } catch (e) {
    const msg = String(e?.message || e || '')
    // 🔁 Fallback local si el backend no responde por 503 / DB no configurada
    if (/database not configured|service unavailable|503/i.test(msg)) {
      const role = (email === 'admin@demo.com') ? 'admin' : (email === 'owner@demo.com') ? 'owner' : 'user'
      const token = `demo.${btoa(email)}.${Date.now()}`
      const user = { name: email.split('@')[0], email, role, _warning: 'fallback-local' }
      setAuthInfo(token, user)
      return { ok: true, token, user, source: 'fallback' }
    }
    throw e
  }
},


  async me() {
    if (BACKEND_CONFIGURED) {
      const rsp = await http('/auth/me', { method: 'GET', auth: true })
      const { token } = getAuthInfo()
      if (token && rsp?.user) setAuthInfo(token, rsp.user)
      return rsp
    }
    const { user } = getAuthInfo()
    return { ok: !!user, user, source: 'local' }
  },

  // ---------- BUSINESS ----------
  /**
   * createBusiness({ name, slug, category, description, phone, address })
   * Backend: POST /business -> { id/_id/businessId, ... }
   * DEMO: crea draft local y devuelve { id, slug, ... }
   */
  async createBusiness(payload) {
    const nslug = norm(payload.slug || payload.name || `negocio-${Date.now()}`)
    const body = {
      ...payload,
      slug: nslug
    }

    if (BACKEND_CONFIGURED) {
      // POST -> preflight (backend debe contestar OPTIONS 200)
      const rsp = await http('/business', { method: 'POST', body, auth: true })
      return rsp
    }

    // DEMO local: crea un draft vacío con business
    const id = crypto.randomUUID?.() || String(Date.now())
    const draft = {
      business: {
        slug: nslug,
        name: payload.name || nslug,
        category: payload.category || '',
        description: payload.description || '',
        phone: payload.phone || '',
        address: payload.address || '',
        website: '',
        instagram: '',
        facebook: '',
        coverUrl: ''
      },
      services: []
    }
    saveDraftLocal(nslug, draft)

    // índice simple de negocios
    try {
      const idx = JSON.parse(localStorage.getItem(bizIdxKey) || '[]')
      idx.push({ id, slug: nslug, name: draft.business.name })
      localStorage.setItem(bizIdxKey, JSON.stringify(idx))
    } catch {}

    return { ok: true, id, slug: nslug, ...draft.business, source: 'local' }
  },

  // ---------- PING ----------
  async ping() {
    if (!BACKEND_CONFIGURED) return { ok:false, backend:false, message:'Backend no configurado' }
    try {
      const res = await http('/', { method: 'GET', auth: false })
      return { ok:true, backend:true, info:res }
    } catch (e) {
      return { ok:false, backend:false, message: String(e?.message || e) }
    }
  },

  // ---------- PÚBLICO ----------
  async getPublicSite(slug){
    const nslug = norm(slug)
    if (BACKEND_CONFIGURED) {
      const r = await http(`/site/${encodeURIComponent(nslug)}`, { method:'GET', auth:false })
      return _normalizeSite(r, nslug)
    }
    const published = loadPublished(nslug)
    if (published) return published
    const draft = loadDraft(nslug)
    if (draft) return draft
    const b = devstore.findBusinessBySlug(nslug) || { slug:nslug, name:'Demo', description:'Sin backend' }
    const services = b.id ? devstore.getServices(b.id).map(s => ({
      serviceId: s.id, title: s.title, description: s.description, price: s.price, durationMin: s.durationMin
    })) : []
    return { business: b, services }
  },

  async getServicesBySlug(slug) {
    const site = await this.getPublicSite(slug)
    return Array.isArray(site?.services) ? site.services : []
  },

  // ---------- PUBLICACIÓN ----------
  async publishSelection(slug, opts = {}) {
    const nslug = norm(slug)

    if (BACKEND_CONFIGURED) {
      const draft = loadDraft(nslug) || {}
      const fields = { phone:true, address:true, website:true, instagram:true, facebook:true, coverUrl:true, ...(opts.fields||{}) }
      const baseFields = ['slug','name','category','description']
      const selectedFields = [...baseFields, ...Object.entries(fields).filter(([,v])=>!!v).map(([k])=>k)]
      const business = { ...pick(draft.business || {}, selectedFields), slug: nslug }

      let services = Array.isArray(draft.services) ? draft.services : []
      if (Array.isArray(opts.serviceIds) && opts.serviceIds.length) {
        const set = new Set(opts.serviceIds)
        services = services.filter(s => set.has(s.serviceId))
      } else {
        services = filterServicesRespectingSelection(services)
      }

      const payload = {
        business,
        services: services.map(s => pick(s, ['serviceId','title','description','price','durationMin']))
      }
      const res = await http('/publish', { method:'POST', body: payload, auth:true })
      return res
    }

    // Local fallback
    const draft = loadDraft(nslug)
    if (!draft) throw new Error(`No hay draft local para "${nslug}"`)
    const business = { ...draft.business }
    let services = Array.isArray(draft.services) ? draft.services : []
    if (Array.isArray(opts.serviceIds) && opts.serviceIds.length) {
      const set = new Set(opts.serviceIds)
      services = services.filter(s => set.has(s.serviceId))
    } else {
      services = filterServicesRespectingSelection(services)
    }
    const toPublish = {
      business: pick(business, ['slug','name','category','description','phone','address','website','instagram','facebook','coverUrl']),
      services: services.map(s => pick(s, ['serviceId','title','description','price','durationMin']))
    }
    savePublished(nslug, toPublish)
    return { ok:true, url:`/site/${nslug}`, slug:nslug, source:'local' }
  },

  // ---------- BOOKING ----------
  async createBooking(slug, payload) {
    const nslug = norm(slug)
    if (BACKEND_CONFIGURED) {
      const res = await http('/booking', { method:'POST', body: { slug: nslug, ...payload }, auth:true })
      return res
    }
    const booking = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      slug: nslug,
      ...payload,
      createdAt: new Date().toISOString()
    }
    saveBookingLocal(nslug, booking)
    return { ok:true, id: booking.id, source:'local' }
  },

  // ---------- UI ----------
  listLocalSites() { return listLocalSites() },
  getLocalDraft(slug) { return loadDraft(slug) },
  getPublished(slug) { return loadPublished(slug) },

  // ---------- EDIT DRAFT ----------
  saveLocalDraft(slug, draft) { return saveDraftLocal(slug, draft) },
  updateBusinessDraft(slug, patch) { 
    const nslug = norm(slug)
    const d = loadDraft(nslug)
    if (!d) throw new Error(`No hay draft local para "${nslug}"`)
    d.business = { ...d.business, ...patch, slug: norm(d.business?.slug || nslug) }
    saveDraftLocal(nslug, d)
    return d
  },
  upsertServiceDraft(slug, service) {
    const nslug = norm(slug)
    const d = loadDraft(nslug)
    if (!d) throw new Error(`No hay draft local para "${nslug}"`)
    const s = {
      serviceId: service.serviceId || service.id || (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
      title: service.title || '',
      description: service.description || '',
      price: Number(service.price || 0),
      durationMin: Number(service.durationMin || 30),
      __selected: !!service.__selected
    }
    const list = Array.isArray(d.services) ? d.services.slice() : []
    const idx = list.findIndex(x => x.serviceId === s.serviceId)
    if (idx >= 0) list[idx] = { ...list[idx], ...s }
    else list.push(s)
    d.services = list
    saveDraftLocal(nslug, d)
    return s
  },
  deleteServiceDraft(slug, serviceId) {
    const nslug = norm(slug)
    const d = loadDraft(nslug)
    if (!d) throw new Error(`No hay draft local para "${nslug}"`)
    d.services = (d.services || []).filter(s => s.serviceId !== serviceId)
    saveDraftLocal(nslug, d)
    return { ok:true }
  },
}
