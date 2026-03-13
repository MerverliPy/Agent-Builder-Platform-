import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/api'
import { useModal } from '../context/ModalContext'

export default function AgentDetailPage() {
  const { id } = useParams()
  const [agent, setAgent] = useState(null)
  useEffect(() => {
    let mounted = true
    api.getAgent(id).then(a => mounted && setAgent(a)).catch(() => mounted && setAgent(null))
    return () => { mounted = false }
  }, [id])

  if (!agent) return <div className="container">Loading or not found</div>

  return (
    <div className="container">
      <div className="detail-header">
        {agent.avatar ? <img className="detail-avatar" src={agent.avatar} alt="avatar" /> : <div className="detail-avatar placeholder">{(agent.name||'A').slice(0,1).toUpperCase()}</div>}
        <h2>{agent.name}</h2>
      </div>
      <div><strong>Skills:</strong> {agent.skills && agent.skills.join(', ')}</div>
      <div><strong>Response style:</strong> {agent.responseStyle}</div>
      <div><strong>Roles:</strong> {agent.roles && agent.roles.join(', ')}</div>
      <div className="meta">Created: {agent.createdAt} • Updated: {agent.updatedAt}</div>
      <p>
          {(() => {
            const { user } = require('../context/AuthContext').useAuth ? require('../context/AuthContext').useAuth() : { user: null }
            const canEdit = user && (user.roles || []).includes('editor') || user && (user.roles || []).includes('admin')
            const canDelete = user && (user.roles || []).includes('admin')
            return (
              <>
                {canEdit && <Link to={`/agents/${id}/edit`}>Edit</Link>}
                {canEdit && ' | '}
                {canDelete && <a href="#" onClick={async (e)=>{e.preventDefault(); const ok = window.confirm(`Delete ${agent.name}?`); if(!ok) return; try{ await api.deleteAgent(id); window.location.href='/agents' } catch(err){ alert('delete failed') }}}>Delete</a>}
              </>
            )
          })()}
      </p>

      {/* modal rendered by ModalProvider */}
    </div>
  )
}
