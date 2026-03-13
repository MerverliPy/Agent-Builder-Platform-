import React from 'react'
import { motion } from 'framer-motion'
import { Card, Avatar, Badge } from '../ui'
import { fadeIn } from '../../lib/animations'

/**
 * AgentPreviewCard Component
 * 
 * Displays a preview of the agent being created in the right panel.
 * This is a static preview shell - live preview logic will be added later.
 */

export default function AgentPreviewCard({
  name,
  avatar,
  skills = [],
  responseStyle = '',
  roles = [],
}) {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      <Card variant="elevated" className="sticky top-20">
        <Card.Content className="p-0 overflow-hidden">
          {/* Preview Header Background */}
          <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-600" />

          {/* Main Content */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex justify-center -mt-12 mb-4">
              <Avatar
                src={avatar}
                name={name || 'Agent'}
                size="2xl"
                className="ring-4 ring-white"
              />
            </div>

            {/* Agent Name */}
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {name || 'Agent Name'}
              </h3>
              {roles && roles.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {roles.join(', ')}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Skills Section */}
            {skills && skills.length > 0 ? (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <Badge key={idx} variant="primary" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Skills
                </p>
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
              </div>
            )}

            {/* Response Style Section */}
            {responseStyle ? (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Response Style
                </p>
                <Badge variant="primary" size="md">
                  {responseStyle}
                </Badge>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Response Style
                </p>
                <div className="h-8 bg-gray-100 rounded animate-pulse w-24" />
              </div>
            )}
          </div>
        </Card.Content>

        {/* Footer Info */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Preview updates as you fill the form
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
