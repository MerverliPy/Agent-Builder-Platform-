import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container, Section } from '../ui/Container'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

/**
 * HeroSection Component
 * 
 * Landing hero section with headline, supporting text, and primary/secondary CTAs.
 */
export const HeroSection = ({ isAuthenticated, systemStatus }) => {
  const navigate = useNavigate()

  return (
    <Section spacing="xl" className="bg-gradient-to-br from-primary-50 via-white to-neutral-50">
      <Container size="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Status Badge */}
          <Badge variant="primary" size="md" className="mb-6">
            {systemStatus && systemStatus !== 'down' ? (
              <>
                <span className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse" />
                System Online
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-neutral-400 rounded-full mr-2" />
                Checking Status...
              </>
            )}
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6">
            Build and manage
            <span className="text-gradient block">custom AI agents</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create specialized AI agents with unique skills, roles, and behaviors. Build your intelligent workforce and deploy them instantly.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/agents/new' : '/login')}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            >
              Create Agent
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/templates')}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            >
              Browse Templates
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}

export default HeroSection
