import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/api'
import AgentForm from '../components/AgentForm'
import AgentPreviewCard from '../components/agent/AgentPreviewCard'
import { Container, Section, Grid } from '../components/ui'
import { fadeIn, slideUp } from '../lib/animations'

export default function AgentCreatePage() {
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({})
  const location = useLocation()
  
  // Get template data from location state if navigating from templates page
  const templateData = location.state?.template || null

  function handleFormChange(data) {
    setFormData(prev => ({ ...prev, ...data }))
  }

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
    <Section className="py-12 bg-gray-50 min-h-screen">
      <Container size="xl">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Page Header */}
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Agent</h1>
            <p className="text-lg text-gray-600">
              Define your agent's identity, capabilities, and behavior. You'll be able to customize these settings after creation.
            </p>
            {templateData && (
              <p className="text-sm text-primary-600 mt-3 font-medium">
                ✓ Starting from <strong>{templateData.name}</strong> template
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              variants={slideUp}
              initial="initial"
              animate="animate"
              className="max-w-3xl p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              <strong>Error:</strong> {error}
            </motion.div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {/* Left Column - Form (2 cols on desktop) */}
            <motion.div
              variants={slideUp}
              initial="initial"
              animate="animate"
              className="lg:col-span-2"
            >
              <AgentForm 
                initial={templateData} 
                onSubmit={handleCreate}
                submitLabel="Create Agent"
                onFormChange={handleFormChange}
              />
            </motion.div>

            {/* Right Column - Preview (1 col on desktop) */}
            <motion.div
              variants={slideUp}
              initial="initial"
              animate="animate"
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <AgentPreviewCard
                  name={formData.name || templateData?.name}
                  avatar={formData.avatar || templateData?.avatar}
                  skills={formData.skills || templateData?.skills || []}
                  responseStyle={formData.responseStyle || templateData?.responseStyle}
                  roles={formData.roles || templateData?.roles || []}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
