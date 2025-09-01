// src/utils/seed.js
// Crea datos reales de prueba en localStorage (negocio + servicios) y setea rol.
import { devstore } from './devstore'
import { devLoginAs, setOwnerBusinessId } from './auth'

export function seedDemo({ makeAdmin = false } = {}) {
  // Asegura usuarios de demo
  const users = devstore.getUsers();
  const owner = users.find(u => u.role === 'owner') || devstore.addUser({ fullName:'Owner Demo', email:'owner@demo.com', role:'owner' });
  const admin = users.find(u => u.role === 'admin') || devstore.addUser({ fullName:'Admin Demo', email:'admin@demo.com', role:'admin' });

  // Crea negocio demo si no existe
  let demo = devstore.findBusinessBySlug('demo-barber');
  if (!demo) {
    demo = devstore.addBusiness({
      name: 'Barbería Aurora',
      slug: 'demo-barber',
      category: 'Barbería',
      description: 'Sitio de demostración creado en localStorage.',
      phone: '+506 8888 0000',
      address: 'San Isidro'
    });
    devstore.addService(demo.id, { title:'Corte de Cabello', description:'Corte clásico', price:5000, durationMin:30 });
    devstore.addService(demo.id, { title:'Afeitado', description:'Afeitado tradicional', price:4000, durationMin:20 });
  }

  // Asigna owner actual
  setOwnerBusinessId(demo.id);
  devLoginAs(makeAdmin ? 'admin' : 'owner', { businessId: demo.id, email: makeAdmin ? admin.email : owner.email });

  return { demo, owner, admin };
}
