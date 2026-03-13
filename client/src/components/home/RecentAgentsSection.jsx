import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container, Section } from '../ui/Container'
import { Button } from '../ui/Button'
import { Grid } from '../ui/Container'
import AgentCard from '../features/AgentCard'
import { LoadingOverlay } from '../ui/Loading'
import api from '../../api/api'
import { staggerContainer } from '../../lib/animations'

/**
 * RecentAgentsSection Component
 * 
 * Displays recent/featured agents using AgentCard component.
 * Shows limited number of agents with "View All" CTA.
 */
export const RecentAgentsSection = ({ isAuthenticated, limit = 3 }) => {
  const navigate = useNavigate()
  const [agents, setAgents] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const fetchAgents = async () => {
      try {
        const list = await api.getAgents()
        if (mounted) {
          setAgents(list.slice(0, limit))
        }
      } catch (err) {
        if (mounted) {
          setError(err)
          setAgents([])
        }
      }
    }

    if (isAuthenticated) {
      fetchAgents()
    } else {
      setAgents([])
    }

    return () => { mounted = false }
  }, [isAuthenticated, limit])

  // Show nothing if not authenticated or still loading
  if (agents === null) {
    return null
  }

  // Show nothing if no agents
  if (agents.length === 0) {
    return null
  }

  return (
    <Section spacing="lg" className="bg-neutral-50">
      <Container size="lg">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Header with View All CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                Recent Agents
              </h2>
              <p className="text-lg text-neutral-600">
                Your recently created agents
              </p>
            </div>
            {agents.length > 0 && (
              <Button
                variant="outline"
                onClick={() => navigate('/agents')}
              >
                View All Agents →
              </Button>
            )}
          </div>

          {/* Agent Grid */}
          <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={6}>
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Section>
  )
}

export default RecentAgentsSection
