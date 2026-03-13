import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/api'
import AgentForm from '../components/AgentForm'
import { Container, Section } from '../components/ui'
import { fadeIn, slideUp } from '../lib/animations'

export default function AgentCreatePage() {
  const [error, setError] = useState(null)
  const location = useLocation()
  
  // Get template data from location state if navigating from templates page
  const templateData = location.state?.template || null

  async function handleCreate(payload) {
    try {
      setError(null)
      const created = await api.createAgent(payload)
      window.location.href = `/agents/${created.id}`
    } catch (err) {
      setError(err.message)
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Agent</h1>
            <p className="text-gray-600">Configure your new AI agent with custom settings</p>
            {templateData && (
              <p className="text-sm text-primary-600 mt-2">
                Starting from <strong>{templateData.name}</strong> template
              </p>
            )}
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
          <AgentForm 
            initial={templateData} 
            onSubmit={handleCreate} 
            submitLabel="Create Agent" 
          />
        </motion.div>
      </Container>
    </Section>
  )
}
