import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/api'
import AgentForm from '../components/AgentForm'
import { Container, Section, LoadingOverlay } from '../components/ui'
import { fadeIn, slideUp } from '../lib/animations'

export default function AgentEditPage() {
  const { id } = useParams()
  const [agent, setAgent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    api.getAgent(id).then(a=>mounted && setAgent(a)).catch(()=>mounted && setAgent(null))
    return () => { mounted = false }
  }, [id])

  async function handleSave(payload) {
    try {
      setError(null)
      await api.updateAgent(id, payload)
      window.location.href = `/agents/${id}`
    } catch (err) {
      setError(err.message)
    }
  }

  if (!agent) {
    return (
      <Section className="py-12">
        <Container>
          <LoadingOverlay text="Loading agent..." />
        </Container>
      </Section>
    )
  }

  return (
    <Section className="py-12">
      <Container size="md">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Agent</h1>
            <p className="text-gray-600">Update settings for {agent.name}</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              variants={slideUp}
              initial="initial"
              animate="animate"
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              <strong>Error:</strong> {error}
            </motion.div>
          )}

          {/* Form */}
          <AgentForm initial={agent} onSubmit={handleSave} submitLabel="Save Changes" />
        </motion.div>
      </Container>
    </Section>
  )
}
