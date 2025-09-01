// src/api.js
// API con fallback a localStorage (demo) y switch FORCE_DEMO para ignorar backend si se desea.
import { devstore } from './utils/devstore'
import { getAuthInfo } from './utils/auth'

// ------- Config -------
const FORCE_DEMO = import.meta.env.VITE_FORCE_DEMO === '1'        // pon 1 para forzar modo demo
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const BACKEND_CONFIGURED = !!BASE && !FORCE_DEMO

// ------- Helpers HTTP -------
async function http(path, { method='GET', body, headers } = {}) {
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`
  const { token } = getAuthInfo()
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const dj = await res.json(); msg = dj.message || msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

// En lugar de romper si falla, devolvemos {__failed:true}
async function httpSafe(path, opts) {
  try { return await http(path, opts) }
  catch (e) {
    console.warn('[api:fallback]', path, e)
    return { __failed: true, error: String(e) }
  }
}

// Normaliza servicio del backend al formato del front
function mapServiceFromBackend(s){
  return {
    serviceId: s?._id || s?.id,
    title: s?.name || s?.title || '',
    description: s?.description || '',
    price: (s?.pricing && s.pricing.basePrice) ?? s?.price ?? 0,
    durationMin: s?.duration ?? s?.durationMin ?? 30
  }
}

// Asegura shape {items:[...]} cuando backend devuelva array plano
function ensureItems(obj){
  if (Array.isArray(obj)) return { items: obj }
  if (obj && Array.isArray(obj.items)) return obj
  return { items: [] }
}

export const api = {
  // ---------- PÚBLICO ----------
  async getBusinessBySlug(slug){
    // 1) Backend si está configurado
    if (BACKEND_CONFIGURED) {
      const r = await httpSafe(`/business/slug/${encodeURIComponent(slug)}`, { method:'GET' })
      if (!r.__failed) {
        // Soporta backends que devuelven {business, services} o solo el negocio
        const business = r.business ? r.business : r
        const servicesRaw = r.services ?? business?.services ?? []
        const services = Array.isArray(servicesRaw) ? servicesRaw.map(mapServiceFromBackend) : []
        return { business, services }
      }
    }
    // 2) Fallback local (demo)
    const b = devstore.findBusinessBySlug(slug) || {
      slug: 'demo-barber',
      name: 'Barbería Aurora (Demo)',
      description: 'Demo sin backend',
      phone: '+506 8888 0000',
      address: 'San Isidro'
    }
    const services = b.id
      ? devstore.getServices(b.id).map(s => ({
          serviceId: s.id,
          title: s.title,
          description: s.description,
          price: s.price,
          durationMin: s.durationMin
        }))
      : []
    return { business: b, services }
  },

  // ---------- ADMIN ----------
  async adminListBusinesses(){
    if (BACKEND_CONFIGURED) {
      const r = await httpSafe('/admin/businesses', { method:'GET' })
      if (!r.__failed) return ensureItems(r)
    }
    return { items: devstore.getBusinesses() }
  },

  async adminListUsers(){
    if (BACKEND_CONFIGURED) {
      const r = await httpSafe('/admin/users', { method:'GET' })
      if (!r.__failed) return ensureItems(r)
    }
    return { items: devstore.getUsers() }
  },

  // ---------- OWNER: NEGOCIO ----------
  async createBusiness(data){
    if (BACKEND_CONFIGURED) {
      const r = await httpSafe('/business', { method:'POST', body:data })
      if (!r.__failed) return r
    }
    return devstore.addBusiness(data)
  },

  async updateBusiness(businessId, data){
    if (BACKEND_CONFIGURED) {
      const r = await httpSafe(`/business/${encodeURIComponent(businessId)}`, { method:'PUT', body:data })
      if (!r.__failed) return r
    }
    return devstore.updateBusiness(businessId, data)
  },

  // ---------- OWNER: SERVICIOS ----------
  async listServices(businessId){
    if (BACKEND_CONFIGURED) {
      const r = await httpSafe(`/services/business/${encodeURIComponent(businessId)}`, { method:'GET' })
      if (!r.__failed) {
        if (Array.isArray(r)) return r.map(mapServiceFromBackend)
        if (Array.isArray(r.items)) return r.items.map(mapServiceFromBackend)
        // si el backend ya devuelve en el shape correcto:
        return Array.isArray(r?.services) ? r.services.map(mapServiceFromBackend) : []
      }
    }
    return devstore.getServices(businessId)
  },

  async createService(businessId, data){
    if (BACKEND_CONFIGURED) {
      const r = await httpSafe(`/services/business/${encodeURIComponent(businessId)}`, { method:'POST', body:data })
      if (!r.__failed) return r
    }
    return devstore.addService(businessId, data)
  },

  async updateService(serviceId, data){
    if (BACKEND_CONFIGURED) {
      const r = await httpSafe(`/services/${encodeURIComponent(serviceId)}`, { method:'PUT', body:data })
      if (!r.__failed) return r
    }
    return devstore.updateService(data.businessId, serviceId, data)
  },

  async deleteService(serviceId, businessId){
    if (BACKEND_CONFIGURED) {
      const r = await httpSafe(`/services/${encodeURIComponent(serviceId)}`, { method:'DELETE' })
      if (!r.__failed) return r
    }
    devstore.deleteService(businessId, serviceId)
    return { ok:true }
  }
}
