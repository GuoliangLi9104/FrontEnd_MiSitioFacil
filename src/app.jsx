import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import Builder from './pages/builder.jsx'
import Preview from './pages/preview.jsx'
import PublicSite from './pages/publicsite.jsx'
import Booking from './pages/booking.jsx'

function App() {
  return (
    <>
      <Navbar />
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/site/:slug" element={<PublicSite />} />
          <Route path="/site/:slug/booking" element={<Booking />} />
          <Route path="*" element={<h4>404 - No encontrado</h4>} />
        </Routes>
      </div>
    </>
  )
}

export default App
