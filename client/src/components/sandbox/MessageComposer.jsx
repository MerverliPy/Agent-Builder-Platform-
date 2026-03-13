import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'

/**
 * MessageComposer Component
 * 
 * Text input with send button for composing chat messages.
 * Supports Enter to send (Shift+Enter for newline).
 * 
 * @param {Object} props
 * @param {Function} props.onSend - Callback when message is sent
 * @param {boolean} props.disabled - Disable input when waiting for response
 * @param {string} props.placeholder - Input placeholder text
 */
export const MessageComposer = ({ 
  onSend, 
  disabled = false, 
  placeholder = 'Type a message...' 
}) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [message])

  const handleSubmit = (e) => {
    e?.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || disabled) return
    
    onSend(trimmed)
    setMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    // Enter without shift sends the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full px-4 py-3 border border-neutral-300 rounded-xl',
            'resize-none overflow-hidden',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
            'transition-all duration-200',
            'text-sm leading-relaxed'
          )}
          aria-label="Message input"
          data-testid="message-composer-input"
        />
      </div>

      <motion.div
        whileTap={{ scale: 0.95 }}
      >
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || !message.trim()}
          className="rounded-xl px-4 py-3 h-auto"
          aria-label="Send message"
          data-testid="message-composer-send"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
            />
          </svg>
        </Button>
      </motion.div>
    </form>
  )
}

export default MessageComposer
