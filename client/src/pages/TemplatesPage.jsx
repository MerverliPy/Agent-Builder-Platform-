import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Section, Button } from '../components/ui'

/**
 * TemplatesPage Component
 * 
 * Placeholder page for agent templates.
 * This page will eventually display pre-configured agent templates
 * that users can quickly deploy.
 */

export default function TemplatesPage() {
  return (
    <Section className="py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Templates</h1>
            <p className="text-gray-600">Pre-configured agent templates coming soon</p>
          </div>
        </div>

        {/* Coming Soon State */}
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 mb-6">Agent templates are currently in development. Check back soon!</p>
          <Button as={Link} to="/agents">
            View Agents
          </Button>
        </div>
      </Container>
    </Section>
  )
}
