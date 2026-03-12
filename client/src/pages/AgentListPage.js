import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import AgentCard from '../components/AgentCard'

export default function AgentListPage() {
  const [agents, setAgents] = useState(null)

  useEffect(() => {
    let mounted = true
    api.getAgents().then(list => mounted && setAgents(list)).catch(()=>mounted && setAgents([]))
    return () => { mounted = false }
  }, [])

  if (agents === null) return <div className="container">Loading...</div>

  const { token, user } = require('../context/AuthContext').useAuth ? require('../context/AuthContext').useAuth() : { token: null, user: null }

  return (
    <div className="container">
      <div className="list-header">
        <h2>Agents</h2>
        {user && (user.roles||[]).length ? <p><Link to="/agents/new" className="btn">Create new agent</Link></p> : <p><Link to="/login" className="btn">Sign in to create</Link></p>}
      </div>
      {agents.length === 0 && <div>No agents yet</div>}
      <div className="agents-grid">
        {agents.map(a => (
          <AgentCard key={a.id} agent={a} />
        ))}
      </div>
    </div>
  )
}
