import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Avatar } from '../ui/Avatar'

/**
 * ChatMessage Component
 * 
 * Renders a single message in the chat transcript.
 * Supports user messages (right-aligned) and agent messages (left-aligned).
 * 
 * @param {Object} props
 * @param {string} props.content - Message content
 * @param {'user'|'agent'} props.role - Message sender role
 * @param {string} props.timestamp - Message timestamp
 * @param {Object} props.agent - Agent data for avatar (optional)
 * @param {boolean} props.isMock - Whether this is a mock/demo response
 * @param {string} props.model - LLM model used (if any)
 */
export const ChatMessage = ({ 
  content, 
  role, 
  timestamp, 
  agent = null,
  isTyping = false,
  isMock = false,
  model = null
}) => {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3 mb-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        ) : (
          <Avatar 
            src={agent?.avatar} 
            name={agent?.name || 'Agent'} 
            size="sm" 
          />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          'max-w-[75%] px-4 py-2 rounded-2xl',
          isUser 
            ? 'bg-primary-600 text-white rounded-br-md' 
            : 'bg-neutral-100 text-neutral-900 rounded-bl-md'
        )}
      >
        {isTyping ? (
          <div className="flex items-center gap-1 py-1">
            <motion.span
              className="w-2 h-2 bg-neutral-400 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="w-2 h-2 bg-neutral-400 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="w-2 h-2 bg-neutral-400 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
        
        {!isTyping && (
          <div className={cn(
            'flex items-center gap-2 mt-1 text-xs',
            isUser ? 'text-primary-200' : 'text-neutral-500'
          )}>
            {timestamp && <span>{timestamp}</span>}
            {!isUser && isMock && (
              <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded text-[10px]">
                demo
              </span>
            )}
            {!isUser && model && !isMock && (
              <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded text-[10px]">
                {model}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ChatMessage
