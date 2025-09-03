// src/utils/persist.js
export const persist = {
  keyForSlug(slug) { return `msf_site_${slug}` },

  saveForSlug(slug, payload) {
    localStorage.setItem(this.keyForSlug(slug), JSON.stringify(payload))
  },

  loadForSlug(slug) {
    const raw = localStorage.getItem(this.keyForSlug(slug))
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
  },

  removeForSlug(slug) { localStorage.removeItem(this.keyForSlug(slug)) },

  listSites() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith('msf_site_'))
      .map(k => {
        try {
          const data = JSON.parse(localStorage.getItem(k)) || {}
          const slug = data?.business?.slug || k.replace('msf_site_', '')
          return { key:k, slug, name:data?.business?.name || slug, category:data?.business?.category || '' }
        } catch {
          const slug = k.replace('msf_site_', '')
          return { key:k, slug, name:slug, category:'' }
        }
      })
  },

  // ==== ALIAS LEGACY (evita "persist.load is not a function") ====
  load(slug) { return this.loadForSlug(slug) },
  save(slug, payload) { return this.saveForSlug(slug, payload) },
  remove(slug) { return this.removeForSlug(slug) },
}

if (typeof window !== 'undefined') window.__persist = persist
