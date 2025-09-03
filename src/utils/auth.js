// src/utils/auth.js
// Manejo de sesión + helpers de demo/owner

const AUTH_KEY = 'msf_auth';           // { token, user }
const OWNER_KEY = 'msf_owner_business'; // businessId del propietario (owner)

export function getAuthInfo() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { token: '', user: null };
    const { token = '', user = null } = JSON.parse(raw);
    return { token, user };
  } catch {
    return { token: '', user: null };
  }
}

export function setAuthInfo(token, user) {
  const data = { token: String(token || ''), user: user || null };
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  return data;
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn() {
  const { token } = getAuthInfo();
  return !!token;
}

// ---------- Owner helpers ----------
export function setOwnerBusinessId(businessId) {
  if (!businessId) return;
  localStorage.setItem(OWNER_KEY, String(businessId));
}

export function getOwnerBusinessId() {
  return localStorage.getItem(OWNER_KEY) || '';
}

export function clearOwnerBusinessId() {
  localStorage.removeItem(OWNER_KEY);
}

/**
 * devLoginAs(role, extraUser?)
 * Inicia sesión “de demo” con un rol específico (admin/owner/user)
 * Útil para pantallas de creación cuando aún no hay backend.
 */
export function devLoginAs(role = 'user', extraUser = {}) {
  const baseUser = {
    id: extraUser.id || crypto.randomUUID?.() || String(Date.now()),
    name: extraUser.name || (role === 'admin' ? 'Admin Demo' : role === 'owner' ? 'Owner Demo' : 'Usuario Demo'),
    email: extraUser.email || (role === 'admin' ? 'admin@demo.com' : role === 'owner' ? 'owner@demo.com' : 'user@demo.com'),
    role,
    ...extraUser
  };
  const token = `demo.${btoa(baseUser.email)}.${Date.now()}`;
  setAuthInfo(token, baseUser);
  return { token, user: baseUser, source: 'dev' };
}
