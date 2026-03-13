import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ModalProvider } from './context/ModalContext'
import { AuthProvider } from './context/AuthContext'
import './styles/globals.css'

// Global error handler for debugging on mobile
window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.error)
  const errorDiv = document.createElement('div')
  errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:20px;z-index:9999;font-size:14px;word-break:break-all;'
  errorDiv.innerHTML = `<strong>Error:</strong> ${e.error?.message || e.message}<br><small>${e.error?.stack || ''}</small>`
  document.body.appendChild(errorDiv)
})

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
