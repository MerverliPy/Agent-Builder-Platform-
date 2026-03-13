import React, { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import api from './api/api'
import AgentCreatePage from './pages/AgentCreatePage'
import AgentDetailPage from './pages/AgentDetailPage'
import AgentListPage from './pages/AgentListPage'
import AgentEditPage from './pages/AgentEditPage'
import AgentCard from './components/AgentCard'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'

function Home() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let mounted = true
    api.ping().then(s => mounted && setStatus(s)).catch(() => mounted && setStatus('down'))
    return () => { mounted = false }
  }, [])

  return (
    <div className="container">
      <h1>Custom Agent Builder Platform</h1>
      <p>Backend status: <strong>{status ? JSON.stringify(status) : 'checking...'}</strong></p>
      <p><Link to="/agents">Go to Agents</Link></p>
    </div>
  )
}

function AgentsPlaceholder() {
  return (
    <div className="container">
      <h2>Agents</h2>
      <p>Agent features will appear here in later phases.</p>
      <p><Link to="/">Home</Link></p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/agents" element={<AgentListPage />} />
      <Route path="/agents/new" element={<AgentCreatePage />} />
      <Route path="/agents/:id" element={<AgentDetailPage />} />
      <Route path="/agents/:id/edit" element={<AgentEditPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  )
}
