const API_BASE = import.meta.env.VITE_API_BASE || 'https://tu-backend-render.onrender.com/api';

export const api = {
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed')
    return res.json()
  },

  async register({ fullName, email, password }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    })
    if (!res.ok) throw new Error((await res.json()).error || 'Register failed')
    return res.json()
  },

  async saveBusiness(token, data) {
    const res = await fetch(`${API_BASE}/business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error((await res.json()).error || 'Save business failed')
    return res.json()
  },

  async getBusinessBySlug(slug) {
    const res = await fetch(`${API_BASE}/public/business/${slug}`)
    if (!res.ok) throw new Error('Business not found')
    return res.json()
  },

  async listServices(token, businessId) {
    const res = await fetch(`${API_BASE}/services?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error listing services')
    return res.json()
  },

  async upsertService(token, payload) {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Error saving service')
    return res.json()
  },

  async deleteService(token, serviceId) {
    const res = await fetch(`${API_BASE}/services/${serviceId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error deleting service')
    return res.json()
  },

  async upsertSchedule(token, payload) {
    const res = await fetch(`${API_BASE}/schedules`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Error saving schedule')
    return res.json()
  },

  async createReservation(payload) {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Error creating reservation')
    return res.json()
  }
}
