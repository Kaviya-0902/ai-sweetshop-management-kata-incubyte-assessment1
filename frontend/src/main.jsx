import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthPage from './pages/AuthPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

function Root() {
  const [hash, setHash] = useState(() => window.location.hash)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [role, setRole] = useState(() => localStorage.getItem('role'))

  useEffect(() => {
    function sync() {
      setHash(window.location.hash)
      setToken(localStorage.getItem('token'))
      setRole(localStorage.getItem('role'))
    }

    window.addEventListener('hashchange', sync)
    window.addEventListener('storage', sync)
    window.addEventListener('authchange', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('storage', sync)
      window.removeEventListener('authchange', sync)
    }
  }, [])

  useEffect(() => {
    if (!hash || hash === '#') {
      window.location.hash = '#shop'
      return
    }

    if (hash === '#admin' && (!token || role !== 'admin')) {
      window.location.hash = '#auth'
    }
  }, [hash, role, token])

  if (hash === '#auth') {
    return <AuthPage />
  }

  if (hash === '#admin' && role === 'admin') {
    return <AdminDashboard />
  }

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
