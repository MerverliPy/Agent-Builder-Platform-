import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/api'
import { Container, Section } from '../components/ui/Container'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { ChatMessage } from '../components/sandbox/ChatMessage'
import { MessageComposer } from '../components/sandbox/MessageComposer'

// Storage key prefix for conversation persistence
const STORAGE_KEY_PREFIX = 'cabp_sandbox_'

// Rate limiting: minimum time between messages (ms)
const MIN_MESSAGE_INTERVAL = 1000

/**
 * Generate a mock response based on agent configuration.
 * Used as fallback when LLM is not configured.
 */
const generateMockResponse = (agent, userMessage) => {
  const style = agent.responseStyle?.toLowerCase() || ''
  const skills = agent.skills || []
  const roles = agent.roles || []
  
  // Base responses by style
  const responses = {
    concise: [
      `Got it. Here's what I found regarding "${userMessage.slice(0, 30)}..."`,
      `Based on my analysis: the key points are relevant to your query.`,
      `Done. Let me know if you need more details.`,
    ],
    friendly: [
      `Great question! I'd be happy to help with that. Let me think about "${userMessage.slice(0, 30)}..."`,
      `Thanks for asking! Here's my take on this...`,
      `Oh, interesting! I've got some thoughts on that.`,
    ],
    technical: [
      `Analyzing your input: "${userMessage.slice(0, 30)}..."\n\nFrom a technical perspective, there are several factors to consider.`,
      `Let me break this down systematically:\n\n1. Primary consideration\n2. Secondary factors\n3. Edge cases`,
      `Based on the parameters provided, the optimal approach would involve multiple considerations.`,
    ],
    teacher: [
      `That's a great question to explore! Let me explain this step by step so it's clear.`,
      `I see what you're asking. Let's build up to the answer together...`,
      `Good thinking! Here's how we can approach this problem...`,
    ],
  }

  // Determine which style to use
  let styleKey = 'friendly'
  if (style.includes('concise')) styleKey = 'concise'
  else if (style.includes('technical') || style.includes('expert')) styleKey = 'technical'
  else if (style.includes('teacher') || style.includes('mentor')) styleKey = 'teacher'

  // Pick a random response from the style
  const styleResponses = responses[styleKey]
  let response = styleResponses[Math.floor(Math.random() * styleResponses.length)]

  // Add skill context if available
  if (skills.length > 0) {
    const skill = skills[Math.floor(Math.random() * skills.length)]
    response += `\n\nDrawing on my ${skill} expertise, I can provide more specific guidance if needed.`
  }

  // Add role context if available
  if (roles.length > 0) {
    const role = roles[0]
    response += `\n\n— Your ${role}`
  }

  return response
}

/**
 * Load conversation from sessionStorage
 */
const loadConversation = (agentId) => {
  try {
    const stored = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${agentId}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate structure - support both old format (messages only) and new format (with conversationId)
      if (Array.isArray(parsed)) {
        return { messages: parsed, conversationId: null }
      }
      if (parsed && Array.isArray(parsed.messages)) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Failed to load conversation from storage:', err)
  }
  return { messages: [], conversationId: null }
}

/**
 * Save conversation to sessionStorage
 */
const saveConversation = (agentId, messages, conversationId) => {
  try {
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${agentId}`, JSON.stringify({
      messages,
      conversationId
    }))
  } catch (err) {
    console.warn('Failed to save conversation to storage:', err)
  }
}

/**
 * Clear conversation from sessionStorage
 */
const clearConversation = (agentId) => {
  try {
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${agentId}`)
  } catch (err) {
    console.warn('Failed to clear conversation from storage:', err)
  }
}

/**
 * AgentSandboxPage
 * 
 * A dedicated testing workspace for interacting with an agent.
 * Uses real LLM API when configured, falls back to mock responses otherwise.
 */
export default function AgentSandboxPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [lastMessageTime, setLastMessageTime] = useState(0)
  const [chatError, setChatError] = useState(null)
  const [useMockMode, setUseMockMode] = useState(false)
  
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Fetch agent data
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    
    api.getAgent(id)
      .then(data => {
        if (mounted) {
          setAgent(data)
          // Load persisted conversation for this agent
          const saved = loadConversation(id)
          setMessages(saved.messages)
          setConversationId(saved.conversationId)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setAgent(null)
          setError(err.message || 'Failed to load agent')
          setLoading(false)
        }
      })
    
    return () => { mounted = false }
  }, [id])

  // Save messages to sessionStorage when they change
  useEffect(() => {
    if (agent && messages.length > 0) {
      saveConversation(id, messages, conversationId)
    }
  }, [id, agent, messages, conversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Format timestamp
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  // Handle sending a message with rate limiting
  const handleSend = useCallback(async (content) => {
    if (!agent) return

    // Rate limiting check
    const now = Date.now()
    if (now - lastMessageTime < MIN_MESSAGE_INTERVAL) {
      console.warn('Message rate limited')
      return
    }
    setLastMessageTime(now)
    setChatError(null)

    const userMessage = {
      id: now,
      role: 'user',
      content,
      timestamp: formatTime(new Date())
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    // Try real API first, fall back to mock if not configured
    if (!useMockMode) {
      try {
        const response = await api.chatWithAgent(id, content, conversationId)
        
        // Update conversation ID if this is a new conversation
        if (response.conversationId && response.conversationId !== conversationId) {
          setConversationId(response.conversationId)
        }

        const agentMessage = {
          id: response.message.id || Date.now(),
          role: 'agent',
          content: response.message.content,
          timestamp: formatTime(new Date()),
          model: response.model
        }

        setMessages(prev => [...prev, agentMessage])
        setIsTyping(false)
        return
      } catch (err) {
        console.warn('Chat API error:', err.message)
        
        // If LLM is not configured, switch to mock mode
        if (err.code === 'llm_not_configured' || err.code === 'llm_auth_error') {
          console.log('LLM not configured, switching to mock mode')
          setUseMockMode(true)
          setChatError({
            type: 'info',
            message: 'AI provider not configured. Using demo mode with simulated responses.'
          })
        } else if (err.code === 'rate_limit') {
          setChatError({
            type: 'warning',
            message: 'Rate limit reached. Please wait a moment before sending another message.'
          })
          // Remove the user message since the API rejected it
          setMessages(prev => prev.filter(m => m.id !== userMessage.id))
          setIsTyping(false)
          return
        } else {
          setChatError({
            type: 'error',
            message: err.message || 'Failed to get response. Using demo mode.'
          })
          setUseMockMode(true)
        }
      }
    }

    // Mock mode fallback
    const thinkingDelay = 800 + Math.random() * 1200
    setTimeout(() => {
      const response = generateMockResponse(agent, content)
      
      const agentMessage = {
        id: Date.now(),
        role: 'agent',
        content: response,
        timestamp: formatTime(new Date()),
        isMock: true
      }

      setMessages(prev => [...prev, agentMessage])
      setIsTyping(false)
    }, thinkingDelay)
  }, [agent, lastMessageTime, id, conversationId, useMockMode])

  // Reset conversation
  const handleReset = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setChatError(null)
    setUseMockMode(false)
    clearConversation(id)
  }, [id])

  // Loading state
  if (loading) {
    return (
      <Section className="min-h-screen">
        <Container size="lg">
          <div className="animate-pulse">
            <div className="h-16 bg-neutral-200 rounded mb-4" />
            <div className="h-96 bg-neutral-200 rounded" />
          </div>
        </Container>
      </Section>
    )
  }

  // Error state
  if (error) {
    return (
      <Section className="min-h-screen">
        <Container size="md">
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Unable to Load Agent
            </h2>
            <p className="text-neutral-600 mb-6">
              {error === 'not found' 
                ? 'This agent does not exist or may have been deleted.'
                : `An error occurred: ${error}`
              }
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button variant="primary" onClick={() => navigate('/agents')}>
                View All Agents
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    )
  }

  // Agent not found (fallback)
  if (!agent) {
    return (
      <Section className="min-h-screen">
        <Container size="md">
          <Card padding="lg" className="text-center">
            <p className="text-neutral-600 mb-4">Agent not found</p>
            <Button variant="primary" onClick={() => navigate('/agents')}>
              Back to Agents
            </Button>
          </Card>
        </Container>
      </Section>
    )
  }

  return (
    <Section className="min-h-screen py-4 lg:py-6">
      <Container size="lg" className="h-full">
        <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)]">
          
          {/* Agent Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card padding="md" className="mb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={agent.avatar} 
                    name={agent.name} 
                    size="lg" 
                  />
                  <div className="min-w-0">
                    <h1 className="text-lg font-semibold text-neutral-900 truncate">
                      {agent.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-neutral-500">
                        {useMockMode ? 'Demo Mode' : 'Sandbox Mode'}
                      </span>
                      {agent.model && !useMockMode && (
                        <Badge variant="secondary" size="sm">
                          {agent.model}
                        </Badge>
                      )}
                      {agent.skills?.slice(0, 2).map((skill, i) => (
                        <Badge key={i} variant="default" size="sm">
                          {skill}
                        </Badge>
                      ))}
                      {agent.skills?.length > 2 && (
                        <span className="text-xs text-neutral-400">
                          +{agent.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={messages.length === 0}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    }
                  >
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/agents/${id}`)}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    }
                  >
                    <span className="hidden sm:inline">Close</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Chat Error Banner */}
          {chatError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                chatError.type === 'info' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : chatError.type === 'warning'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {chatError.message}
            </motion.div>
          )}

          {/* Chat Area */}
          <Card padding="none" className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 lg:p-6"
            >
              <AnimatePresence>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center px-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-medium text-neutral-900 mb-2">
                      Test {agent.name}
                    </h2>
                    <p className="text-sm text-neutral-500 max-w-sm">
                      Start a conversation to test this agent's behavior. 
                      Your conversation will be saved for this session.
                    </p>
                    {agent.model && (
                      <p className="text-xs text-neutral-400 mt-2">
                        Model: {agent.model}
                      </p>
                    )}
                    {agent.responseStyle && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Style: {agent.responseStyle}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <div>
                    {messages.map((msg) => (
                      <ChatMessage
                        key={msg.id}
                        content={msg.content}
                        role={msg.role}
                        timestamp={msg.timestamp}
                        agent={agent}
                        isMock={msg.isMock}
                        model={msg.model}
                      />
                    ))}
                    
                    {/* Typing indicator */}
                    {isTyping && (
                      <ChatMessage
                        role="agent"
                        agent={agent}
                        isTyping={true}
                      />
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Composer */}
            <div className="border-t border-neutral-200 p-4">
              <MessageComposer
                onSend={handleSend}
                disabled={isTyping}
                placeholder={`Message ${agent.name}...`}
              />
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  )
}
