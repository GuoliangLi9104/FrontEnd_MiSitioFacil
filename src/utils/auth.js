// src/utils/auth.js
// Auth "quemado" para desarrollo: guarda rol/owner en localStorage.
export function getAuthInfo() {
  const role = localStorage.getItem('role') || 'client'; // 'admin' | 'owner' | 'client'
  const businessId = localStorage.getItem('businessId') || null;
  const email = localStorage.getItem('email') || (role === 'admin' ? 'admin@demo.com' : 'owner@demo.com');
  const token = localStorage.getItem('token') || null; // opcional (para backend real)
  return { role, businessId, email, token };
}
export function devLoginAs(role = 'client', opts = {}) {
  localStorage.setItem('role', role);
  if (opts.businessId) localStorage.setItem('businessId', opts.businessId);
  if (opts.email) localStorage.setItem('email', opts.email);
  if (opts.token) localStorage.setItem('token', opts.token);
}
export function setOwnerBusinessId(businessId) {
  localStorage.setItem('businessId', businessId);
}
export function logoutDev() {
  localStorage.removeItem('token');
  localStorage.setItem('role', 'client');
  localStorage.removeItem('businessId');
  localStorage.removeItem('email');
}
