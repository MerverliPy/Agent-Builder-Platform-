import React from 'react'
import { motion } from 'framer-motion'
import { Container, Section, Grid } from '../components/ui'
import TemplateCard from '../components/templates/TemplateCard'
import { fadeIn, slideUp, staggerContainer, staggerItem } from '../lib/animations'

/**
 * TemplatesPage Component
 * 
 * Displays pre-configured agent templates that users can use as starting points
 * for creating their own custom agents.
 */

const templates = [
  {
    id: 'developer-assistant',
    name: 'Developer Assistant',
    description: 'Helps with coding tasks, debugging, and technical questions',
    skills: ['JavaScript', 'Python', 'Debugging', 'Code Review'],
    responseStyle: 'Technical and detailed',
  },
  {
    id: 'research-analyst',
    name: 'Research Analyst',
    description: 'Conducts research and provides data-driven insights',
    skills: ['Data Analysis', 'Research', 'Reporting', 'Synthesis'],
    responseStyle: 'Analytical and comprehensive',
  },
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'Handles customer inquiries and provides helpful solutions',
    skills: ['Customer Service', 'Problem Solving', 'Communication', 'Empathy'],
    responseStyle: 'Friendly and helpful',
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Generates creative content and copywriting assistance',
    skills: ['Writing', 'Storytelling', 'Copywriting', 'Brainstorming'],
    responseStyle: 'Creative and engaging',
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyzes data and creates actionable insights',
    skills: ['Data Analysis', 'Statistics', 'Visualization', 'SQL'],
    responseStyle: 'Precise and data-driven',
  },
  {
    id: 'technical-reviewer',
    name: 'Technical Reviewer',
    description: 'Reviews technical work and provides constructive feedback',
    skills: ['Technical Review', 'Quality Assurance', 'Best Practices', 'Optimization'],
    responseStyle: 'Professional and constructive',
  },
]

export default function TemplatesPage() {
  return (
    <Section className="py-12">
      <Container>
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Start from a template
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Choose from our pre-configured templates to quickly create agents
                tailored to specific use cases. Customize them later to match your needs.
              </p>
            </div>
          </div>

          {/* Templates Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <Grid cols={{ default: 1, sm: 2, md: 3 }} gap={6}>
              {templates.map((template) => (
                <motion.div key={template.id} variants={staggerItem}>
                  <TemplateCard {...template} />
                </motion.div>
              ))}
            </Grid>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  )
}
