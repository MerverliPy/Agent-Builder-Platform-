import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container, Section } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { staggerContainer, staggerItem } from '../lib/animations'

/**
 * HomePage Component
 * 
 * Landing page with hero section and feature highlights.
 */

export default function HomePage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let mounted = true
    api.ping()
      .then(s => mounted && setStatus(s))
      .catch(() => mounted && setStatus('down'))
    return () => { mounted = false }
  }, [])

  const features = [
    {
      title: 'Create Custom Agents',
      description: 'Build intelligent agents with customizable skills, roles, and response styles.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      title: 'Visual Agent Cards',
      description: 'Organize and browse your agents in an intuitive card-based interface.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      title: 'Role-Based Access',
      description: 'Secure your agents with role-based permissions and access control.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <Section spacing="xl" className="bg-gradient-to-br from-primary-50 via-white to-neutral-50">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="primary" size="md" className="mb-6">
              {status && status !== 'down' ? (
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

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6">
              Custom Agent
              <span className="text-gradient block">Builder Platform</span>
            </h1>

            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Create, manage, and deploy intelligent agents with ease. Build powerful AI assistants tailored to your specific needs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/agents')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              >
                Browse Agents
              </Button>

              {!token && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section spacing="lg">
        <Container size="lg">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Everything you need to build and manage your AI agent collection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <Card hover className="h-full">
                    <CardContent>
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section spacing="lg" className="bg-neutral-900">
        <Container size="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-neutral-300 mb-8">
              Create your first agent in minutes
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(token ? '/agents/new' : '/login')}
            >
              {token ? 'Create Agent' : 'Sign In to Start'}
            </Button>
          </motion.div>
        </Container>
      </Section>
    </>
  )
}
