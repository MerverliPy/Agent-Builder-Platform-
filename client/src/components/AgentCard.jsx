import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../config/api'

export default function AgentCard({ agent }) {
  const { token, user } = useAuth()
  const canEdit = user && ((user.roles || []).includes('editor') || (user.roles || []).includes('admin'))
  const canDelete = user && (user.roles || []).includes('admin')
  return (
    <article className="agent-card" data-testid={`agent-${agent.id}`}>
      <div className="agent-avatar">{agent.avatar ? <img src={agent.avatar} alt="avatar" /> : <div className="avatar-placeholder">{(agent.name||'A').slice(0,1).toUpperCase()}</div>}</div>
      <div className="agent-body">
        <h3 className="agent-name"><Link to={`/agents/${agent.id}`} data-testid={`agent-link-${agent.id}`}>{agent.name || agent.id}</Link></h3>
        <div className="agent-meta">{agent.responseStyle || '—'}</div>
        <div className="agent-skills">{(agent.skills||[]).slice(0,4).join(', ')}</div>
        <div className="agent-actions">
          <Link to={`/agents/${agent.id}`} data-testid={`agent-view-${agent.id}`}>View</Link>
          {canEdit && <Link to={`/agents/${agent.id}/edit`} data-testid={`agent-edit-${agent.id}`}>Edit</Link>}
          {canDelete && <a href="#" data-testid={`agent-delete-${agent.id}`} onClick={(e)=>{e.preventDefault(); if(confirm('Delete?')) { fetch(`${API_BASE}/agents/${agent.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(()=>window.location.reload()).catch(()=>alert('delete failed')) } }}>Delete</a>}
        </div>
      </div>
    </article>
  )
}
