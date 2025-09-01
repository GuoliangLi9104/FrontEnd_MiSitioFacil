// src/utils/devstore.js
// Fallback local (sin backend): persiste en localStorage.
const K = { BUSINESSES:'msf_businesses', USERS:'msf_users', SERVICES:(bid)=>`msf_services_${bid}` };
const load = (k,f)=>{ try{ const r=localStorage.getItem(k); return r?JSON.parse(r):(f??[]) }catch{ return f??[] } };
const save = (k,d)=> localStorage.setItem(k, JSON.stringify(d));

export const devstore = {
  // Usuarios de demo (admin/owner quemados)
  getUsers(){ const u=load(K.USERS,[{id:'u-1',fullName:'Admin Demo',email:'admin@demo.com',role:'admin'},{id:'u-2',fullName:'Owner Demo',email:'owner@demo.com',role:'owner'}]); save(K.USERS,u); return u },
  addUser(user){ const l=this.getUsers(); const id=crypto.randomUUID(); const row={id,...user}; l.push(row); save(K.USERS,l); return row },

  // Negocios
  getBusinesses(){ const b=load(K.BUSINESSES,[]); save(K.BUSINESSES,b); return b },
  addBusiness(biz){ const l=this.getBusinesses(); const id=crypto.randomUUID(); const row={id,createdAt:new Date().toISOString(),status:'active',...biz}; l.push(row); save(K.BUSINESSES,l); return row },
  updateBusiness(id,patch){ const l=this.getBusinesses(); const i=l.findIndex(x=>x.id===id); if(i>=0){ l[i]={...l[i],...patch}; save(K.BUSINESSES,l); return l[i] } return null },
  findBusinessBySlug(slug){ return this.getBusinesses().find(b=>b.slug===slug)||null },

  // Servicios
  getServices(bid){ return load(K.SERVICES(bid),[]) },
  addService(bid,svc){ const l=this.getServices(bid); const row={id:crypto.randomUUID(),...svc}; l.push(row); save(K.SERVICES(bid),l); return row },
  updateService(bid,id,patch){ const l=this.getServices(bid); const i=l.findIndex(s=>s.id===id); if(i>=0){ l[i]={...l[i],...patch}; save(K.SERVICES(bid),l); return l[i] } return null },
  deleteService(bid,id){ const l=this.getServices(bid).filter(s=>s.id!==id); save(K.SERVICES(bid),l) }
};
