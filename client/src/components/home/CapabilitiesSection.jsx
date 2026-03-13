import React from 'react'
import { motion } from 'framer-motion'
import { Container, Section } from '../ui/Container'
import { Card, CardContent } from '../ui/Card'
import { staggerContainer, staggerItem } from '../../lib/animations'

/**
 * CapabilitiesSection Component
 * 
 * Value proposition section with three key capabilities columns.
 */
export const CapabilitiesSection = () => {
  const capabilities = [
    {
      title: 'Create Agents',
      description: 'Build intelligent agents with customizable skills, roles, and behavior patterns. Define how your agents interact with users and respond to queries.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      title: 'Organize Agents',
      description: 'Manage your growing collection of agents with an intuitive interface. Search, filter, and organize agents by role, skill, or custom tags.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        </svg>
      ),
    },
    {
      title: 'Customize Behavior',
      description: 'Fine-tune agent responses with response styles, skill combinations, and role-based permissions. Make each agent uniquely suited for its purpose.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      ),
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
              Everything you need
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Complete toolset to build, manage, and customize your AI agents
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card hover className="h-full">
                  <CardContent>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                      {capability.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                      {capability.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {capability.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}

export default CapabilitiesSection
