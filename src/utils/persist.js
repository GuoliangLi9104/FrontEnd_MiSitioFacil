// src/utils/persist.js
const KEY = 'msf_builder_draft_v1'

export const persist = {
  load() {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  },
  save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {}
  },
  clear() {
    try { localStorage.removeItem(KEY) } catch {}
  }
}

// Pequeño debounce para no escribir en cada tecla
export function debounce(fn, ms = 300) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}
