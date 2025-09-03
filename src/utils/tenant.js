// src/utils/tenant.js
// Lee el subdominio respecto a tu dominio raíz.
// Prod: usa VITE_ROOT_DOMAIN (p.ej. misitiofacil.org)
// Dev: soporta demo.localhost:5173
const ROOT_DOMAIN = (import.meta.env.VITE_ROOT_DOMAIN || 'misitiofacil.org').toLowerCase();

export function getSubdomain(hostname = window.location.hostname) {
  const host = (hostname || '').toLowerCase();

  // Soporte para *.localhost
  if (host.endsWith('localhost')) {
    const parts = host.split('.');
    return parts.length > 1 ? parts[0] : null; // demo.localhost -> demo
  }

  const parts = host.split('.');
  const rootParts = ROOT_DOMAIN.split('.');
  if (parts.length <= rootParts.length) return null;
  if (parts.slice(-rootParts.length).join('.') !== ROOT_DOMAIN) return null;
  return parts.slice(0, -rootParts.length).join('.') || null;
}
