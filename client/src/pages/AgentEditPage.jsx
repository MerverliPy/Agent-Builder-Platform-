import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'

export default function AgentEditPage() {
  const { id } = useParams()
  const [agent, setAgent] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let mounted = true
    api.getAgent(id).then(a=>mounted && setAgent(a)).catch(()=>mounted && setAgent(null))
    return () => { mounted = false }
  }, [id])

  if (!agent) return <div className="container">Loading...</div>

  async function handleSave(payload) {
    try {
      await api.updateAgent(id, payload)
      window.location.href = `/agents/${id}`
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="container">
      <h2>Edit Agent</h2>
      <AgentForm initial={agent} onSubmit={handleSave} submitLabel="Save" />
      <div>Status: {status}</div>
    </div>
  )
}
