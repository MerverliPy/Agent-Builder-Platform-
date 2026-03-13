import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import AgentCard from '../components/features/AgentCard'
import { Container, Section, Grid, Button, LoadingOverlay } from '../components/ui'
import { staggerContainer } from '../lib/animations'

export default function AgentListPage() {
  const [agents, setAgents] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true
    api.getAgents().then(list => mounted && setAgents(list)).catch(()=>mounted && setAgents([]))
    return () => { mounted = false }
  }, [])

  if (agents === null) {
    return (
      <Section className="py-12">
        <Container>
          <LoadingOverlay text="Loading agents..." />
        </Container>
      </Section>
    )
  }

  const canCreate = user && (user.roles || []).length > 0

  return (
    <Section className="py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agents</h1>
            <p className="text-gray-600">Discover and interact with AI agents</p>
          </div>
          {canCreate ? (
            <Button as={Link} to="/agents/new" size="lg" data-testid="create-agent-button">
              Create Agent
            </Button>
          ) : (
            <Button as={Link} to="/login" variant="outline" size="lg">
              Sign in to create
            </Button>
          )}
        </div>

        {/* Empty State */}
        {agents.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents yet</h3>
            <p className="text-gray-600 mb-6">Be the first to create an agent!</p>
            {canCreate && (
              <Button as={Link} to="/agents/new" data-testid="create-first-agent-button">
                Create your first agent
              </Button>
            )}
          </div>
        )}

        {/* Agent Grid */}
        {agents.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={6}>
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </Grid>
          </motion.div>
        )}
      </Container>
    </Section>
  )
}
