import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container, Section } from '../ui/Container'
import { Card, CardContent } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

/**
 * AgentDetail Component
 * 
 * Displays full details of an agent with edit/delete actions.
 * 
 * @example
 * <AgentDetail agent={agentData} onDelete={handleDelete} />
 */

export const AgentDetail = ({ agent, onDelete, loading = false }) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const canEdit = user && (user.roles?.includes('admin') || user.roles?.includes('editor'))
  const canDelete = user && user.roles?.includes('admin')

  const handleEdit = () => {
    navigate(`/agents/${agent.id}/edit`)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      onDelete && onDelete(agent.id)
    }
  }

  if (loading) {
    return (
      <Section>
        <Container size="md">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mb-6" />
            <div className="h-64 bg-neutral-200 rounded" />
          </div>
        </Container>
      </Section>
    )
  }

  if (!agent) {
    return (
      <Section>
        <Container size="md">
          <Card className="text-center py-12">
            <p className="text-neutral-600">Agent not found</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/agents')}
            >
              Back to Agents
            </Button>
          </Card>
        </Container>
      </Section>
    )
  }

  return (
    <Section>
      <Container size="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/agents')}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              Back to Agents
            </Button>
          </div>

          {/* Main Card */}
          <Card padding="lg">
            <CardContent>
              {/* Agent Header */}
              <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 pb-8 border-b border-neutral-200">
                <Avatar
                  src={agent.avatar}
                  name={agent.name}
                  size="2xl"
                  className="flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    {agent.name}
                  </h1>
                  
                  {agent.responseStyle && (
                    <p className="text-lg text-neutral-600 mb-4">
                      {agent.responseStyle}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {canEdit && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleEdit}
                        icon={
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      >
                        Edit
                      </Button>
                    )}
                    
                    {canDelete && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleDelete}
                        icon={
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              {agent.skills && agent.skills.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.skills.map((skill, index) => (
                      <Badge key={index} variant="primary" size="md">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Roles Section */}
              {agent.roles && agent.roles.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">Roles</h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.roles.map((role, index) => (
                      <Badge key={index} variant="default" size="md">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-neutral-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Additional Information</h2>
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Agent ID</dt>
                    <dd className="mt-1 text-sm text-neutral-900 font-mono">{agent.id}</dd>
                  </div>
                  {agent.createdAt && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-500">Created</dt>
                      <dd className="mt-1 text-sm text-neutral-900">
                        {new Date(agent.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Section>
  )
}

export default AgentDetail
