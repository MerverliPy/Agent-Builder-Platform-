import React, { useState } from 'react'
import api from '../api/api'
import AgentForm from '../components/AgentForm'

export default function AgentCreatePage() {
  const [error, setError] = useState(null)

  async function handleCreate(payload) {
    try {
      const created = await api.createAgent(payload)
      window.location.href = `/agents/${created.id}`
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container">
      <h2>Create Agent</h2>
      <AgentForm onSubmit={handleCreate} submitLabel="Create" />
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}
