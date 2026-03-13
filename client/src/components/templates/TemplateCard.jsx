import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Badge, Button, Avatar, Stack } from '../ui'
import { hoverLift } from '../../lib/animations'

/**
 * TemplateCard Component
 * 
 * Displays a template card with icon, description, and action button.
 * Used in the Templates page to show pre-configured agent templates.
 */

export default function TemplateCard({
  id,
  name,
  description,
  icon,
  skills,
  responseStyle,
}) {
  const navigate = useNavigate()

  function handleUseTemplate() {
    // Navigate to create page with template data in state
    navigate('/agents/new', {
      state: {
        template: {
          id,
          name,
          skills,
          responseStyle,
        },
      },
    })
  }

  return (
    <motion.div
      variants={hoverLift}
      initial="initial"
      whileHover="whileHover"
      whileTap="whileTap"
    >
      <Card
        variant="default"
        hover
        interactive
        className="h-full flex flex-col"
      >
        <Card.Content className="p-6 flex-1 flex flex-col gap-4">
          {/* Icon/Avatar */}
          <div className="flex items-center gap-3">
            <Avatar name={name} size="lg" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <Badge key={idx} variant="primary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Response Style */}
          {responseStyle && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Response Style</p>
              <Badge variant="default" className="text-xs">
                {responseStyle}
              </Badge>
            </div>
          )}
        </Card.Content>

        {/* Footer */}
        <Card.Footer className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <Button
            size="sm"
            className="w-full"
            onClick={handleUseTemplate}
          >
            Use Template
          </Button>
        </Card.Footer>
      </Card>
    </motion.div>
  )
}
