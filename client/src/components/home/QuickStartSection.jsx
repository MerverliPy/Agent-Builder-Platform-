import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container, Section } from '../ui/Container'
import { Card, CardContent } from '../ui/Card'
import { staggerContainer, staggerItem } from '../../lib/animations'

/**
 * QuickStartSection Component
 * 
 * Three action cards for common user flows: create from scratch, use template, duplicate existing.
 */
export const QuickStartSection = ({ isAuthenticated }) => {
  const navigate = useNavigate()

  const actions = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      title: 'Create from Scratch',
      description: 'Build a new agent from the ground up with custom skills and behavior.',
      action: isAuthenticated
        ? () => navigate('/agents/new')
        : () => navigate('/login'),
      label: isAuthenticated ? 'Create Agent' : 'Sign in to Create',
      disabled: false,
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: 'Use a Template',
      description: 'Start with pre-built templates to jumpstart your agent creation.',
      action: () => navigate('/templates'),
      label: 'Browse Templates',
      disabled: false,
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Duplicate Existing',
      description: 'Clone an existing agent and customize it for a new purpose.',
      action: () => navigate('/agents'),
      label: 'View Agents',
      disabled: !isAuthenticated,
    },
  ]

  return (
    <Section spacing="lg">
      <Container size="lg">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Quick Start
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Choose your path to creating the perfect agent
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actions.map((action, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card
                  interactive={!action.disabled}
                  hover={!action.disabled}
                  onClick={action.action}
                  className={`h-full flex flex-col cursor-pointer transition-opacity ${
                    action.disabled ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <CardContent className="flex-1">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                      {action.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-neutral-600">
                      {action.description}
                    </p>
                  </CardContent>
                  <div className="border-t border-neutral-100 pt-4 mt-4">
                    <div className="text-sm font-medium text-primary-600">
                      {action.label} →
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}

export default QuickStartSection
