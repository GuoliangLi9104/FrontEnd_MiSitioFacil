// src/App.jsx  (agrega rutas Admin/Create/Owner si aún no están)
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import Footer from './components/footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/home.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import Builder from './pages/builder.jsx'
import Preview from './pages/preview.jsx'
import PublicSite from './pages/publicsite.jsx'
import Booking from './pages/booking.jsx'
import TemplateSelector from './pages/TemplateSelector.jsx'
import SchedulePage from './pages/schedule.jsx'

// nuevas páginas
import AdminPage from './pages/admin.jsx'
import CreatePage from './pages/create.jsx'
import OwnerPage from './pages/owner.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="py-4">
        <div className="container">
          <Routes>
            {/* público */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/site/:slug" element={<PublicSite />} />
            <Route path="/site/:slug/booking" element={<Booking />} />

            {/* demo/admin/owner */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/owner" element={<OwnerPage />} />

            {/* privado existente */}
            <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/preview" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><TemplateSelector /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<h4>404 - No encontrado</h4>} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  )
}
