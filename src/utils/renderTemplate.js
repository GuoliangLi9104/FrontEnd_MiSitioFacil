// /src/utils/renderTemplate.js
// Mini-motor de plantillas con reemplazos simples y bloques {{#each services}} ... {{/each}}

export function renderTemplate(tpl, data = {}) {
  const safe = (v) => (v ?? '').toString();

  const business = data.business || {};
  const slug = business.slug || 'demo';

  // Reemplazos simples de business.*
  tpl = tpl
    .replace(/{{\s*business\.name\s*}}/g, safe(business.name))
    .replace(/{{\s*business\.phone\s*}}/g, safe(business.phone))
    .replace(/{{\s*business\.email\s*}}/g, safe(business.email))
    .replace(/{{\s*business\.category\s*}}/g, safe(business.category))
    .replace(/{{\s*business\.address\s*}}/g, safe(business.address))
    .replace(/{{\s*business\.coverUrl\s*}}/g, safe(business.coverUrl))
    .replace(/{{\s*business\.slug\s*}}/g, safe(slug));

  // Atajo útil para CTA de reserva
  tpl = tpl.replace(/{{\s*bookingUrl\s*}}/g, `/site/${slug}/booking`);

  // Bloque {{#if business.coverUrl}}...{{/if}}
  tpl = tpl.replace(
    /{{#if\s+business\.coverUrl}}([\s\S]*?){{\/if}}/g,
    business.coverUrl ? '$1' : ''
  );

  // Bloque {{#each services}}...{{/each}}
  const services = Array.isArray(data.services) ? data.services : [];
  tpl = tpl.replace(/{{#each\s+services}}([\s\S]*?){{\/each}}/g, (_, block) => {
    return services.map((s) => {
      let b = block;

      // if por item: {{#if this.imageUrl}}...{{/if}}
      b = b.replace(
        /{{#if\s+this\.imageUrl}}([\s\S]*?){{\/if}}/g,
        s?.imageUrl ? '$1' : ''
      );

      b = b.replace(/{{\s*this\.title\s*}}/g, safe(s.title || 'Sin título'));
      b = b.replace(/{{\s*this\.description\s*}}/g, safe(s.description || ''));
      b = b.replace(/{{\s*this\.durationMin\s*}}/g, safe(s.durationMin || 0));
      b = b.replace(/{{\s*this\.price\s*}}/g, safe(formatCRC(s.price)));
      b = b.replace(/{{\s*this\.imageUrl\s*}}/g, safe(s.imageUrl || ''));

      return b;
    }).join('');
  });

  return tpl;
}

export function formatCRC(n) {
  try {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 0,
    }).format(Number(n || 0));
  } catch {
    return `₡${Number(n || 0).toFixed(0)}`;
  }
}
