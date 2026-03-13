import React from 'react'
import { motion } from 'framer-motion'
import { Card, Avatar, Badge } from '../ui'
import { fadeIn } from '../../lib/animations'

/**
 * AgentPreviewCard Component
 * 
 * Displays a live preview of the agent being created in the right panel.
 * Updates in real-time as the user edits form fields.
 */

export default function AgentPreviewCard({
  name,
  avatar,
  skills = [],
  responseStyle = '',
  roles = [],
}) {
  // Smooth transition animation for content changes
  const contentVariants = {
    initial: { opacity: 0.8 },
    animate: { opacity: 1 },
    exit: { opacity: 0.8 },
    transition: { duration: 0.15 },
  }

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
              <motion.div
                key={avatar || 'default'}
                variants={contentVariants}
                initial="initial"
                animate="animate"
              >
                <Avatar
                  src={avatar}
                  name={name || 'Agent'}
                  size="2xl"
                  className="ring-4 ring-white"
                />
              </motion.div>
            </div>

            {/* Agent Name */}
            <div className="text-center mb-4">
               <motion.h3
                 key={`name-${name}`}
                 variants={contentVariants}
                 initial="initial"
                 animate="animate"
                 className="text-2xl font-bold text-gray-900"
               >
                 <span data-testid="agent-preview-name">{name || 'Agent Name'}</span>
               </motion.h3>
              {roles && roles.length > 0 && (
                <motion.p
                  key={`roles-${roles.join(',')}`}
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  className="text-sm text-gray-600 mt-1"
                >
                  {roles.join(', ')}
                </motion.p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Skills Section */}
            {skills && skills.length > 0 ? (
              <motion.div
                key={`skills-${skills.join(',')}`}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                className="mb-4"
              >
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <motion.div
                      key={`${skill}-${idx}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Badge variant="primary" size="sm">
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="skills-empty"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                className="mb-4"
              >
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Skills
                </p>
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
              </motion.div>
            )}

            {/* Response Style Section */}
            {responseStyle ? (
              <motion.div
                key={`style-${responseStyle}`}
                variants={contentVariants}
                initial="initial"
                animate="animate"
              >
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Response Style
                </p>
                <Badge variant="primary" size="md">
                  {responseStyle}
                </Badge>
              </motion.div>
            ) : (
              <motion.div
                key="style-empty"
                variants={contentVariants}
                initial="initial"
                animate="animate"
              >
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Response Style
                </p>
                <div className="h-8 bg-gray-100 rounded animate-pulse w-24" />
              </motion.div>
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
