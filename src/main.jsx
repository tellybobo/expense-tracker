import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'

function Root() {
  const token = localStorage.getItem("token")
  const [isLoggedIn, setIsLoggedIn] = useState(token ? true : false)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isLoggedIn ? <Navigate to="/" /> : <Login onLogin={() => setIsLoggedIn(true)} />
        } />
        <Route path="/register" element={
          isLoggedIn ? <Navigate to="/" /> : <Register onRegister={() => window.location.href = '/login'} />
        } />
        <Route path="/" element={
          isLoggedIn ? <App onLogout={() => {
            localStorage.removeItem("token")
            localStorage.removeItem("name")
            setIsLoggedIn(false)
          }} /> : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)