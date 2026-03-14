import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

/**
 * AgentCard Component
 * 
 * Displays an agent in a card format with hover effects.
 * Used in grid layouts on the agents list page.
 * 
 * @example
 * <AgentCard agent={agentData} />
 */

export const AgentCard = ({ agent, className, onDelete, ...props }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/agents/${agent.id}`)
  }

  const handleTest = (e) => {
    e.stopPropagation()
    navigate(`/agents/${agent.id}/sandbox`)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(agent.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        interactive
        onClick={handleClick}
        className={cn('h-full flex flex-col', className)}
        {...props}
      >
        <CardContent className="flex-1">
          {/* Avatar and Name */}
          <div className="flex items-start gap-4 mb-4">
            <Avatar
              src={agent.avatar}
              name={agent.name}
              size="lg"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-neutral-900 truncate mb-1">
                {agent.name}
              </h3>
              {agent.responseStyle && (
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {agent.responseStyle}
                </p>
              )}
            </div>
          </div>

          {/* Skills */}
          {agent.skills && agent.skills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-neutral-500 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {agent.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="primary" size="sm">
                    {skill}
                  </Badge>
                ))}
                {agent.skills.length > 3 && (
                  <Badge variant="outline" size="sm">
                    +{agent.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Roles */}
          {agent.roles && agent.roles.length > 0 && (
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">Roles</p>
              <div className="flex flex-wrap gap-2">
                {agent.roles.slice(0, 2).map((role, index) => (
                  <Badge key={index} variant="default" size="sm">
                    {role}
                  </Badge>
                ))}
                {agent.roles.length > 2 && (
                  <Badge variant="outline" size="sm">
                    +{agent.roles.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-neutral-100 pt-4">
          <div className="flex gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClick}
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTest}
              className="flex-1"
              data-testid="test-agent-button"
            >
              Test
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

/**
 * AgentCardSkeleton Component
 * 
 * Loading skeleton for AgentCard.
 */
export const AgentCardSkeleton = () => {
  return (
    <Card className="h-full">
      <CardContent>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-neutral-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-neutral-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-neutral-200 rounded animate-pulse w-full" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-neutral-200 rounded animate-pulse w-1/4" />
          <div className="flex gap-2">
            <div className="h-6 bg-neutral-200 rounded-full animate-pulse w-16" />
            <div className="h-6 bg-neutral-200 rounded-full animate-pulse w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AgentCard
