const request = require('supertest')
const createApp = require('../app')
const storage = require('../storage')
const conversationService = require('../services/conversationService')

describe('Chat API', () => {
  let app
  let adminToken
  let adminUser
  let testAgent

  beforeAll(async () => {
    app = createApp()

    // Create admin user
    const adminRegRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'chatadmin', password: 'admin123', roles: ['admin', 'editor'] })
    adminUser = adminRegRes.body

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'chatadmin', password: 'admin123' })
    adminToken = adminLoginRes.body.token

    // Create test agent with LLM settings
    const agentRes = await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Chat Agent',
        skills: ['testing'],
        roles: ['assistant'],
        responseStyle: 'friendly',
        systemPrompt: 'You are a helpful test assistant.',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 1024
      })
    testAgent = agentRes.body
  })

  afterAll(async () => {
    // Cleanup
    if (testAgent) await storage.delete(testAgent.id)
    if (adminUser) await storage.delete(adminUser.id)
  })

  describe('POST /api/agents/:id/chat', () => {
    it('should return llm_not_configured when no API key is set', async () => {
      const res = await request(app)
        .post(`/api/agents/${testAgent.id}/chat`)
        .send({ message: 'Hello!' })

      expect(res.status).toBe(503)
      expect(res.body.error).toBe('llm_not_configured')
      expect(res.body.provider).toBe('openai')
    })

    it('should return 404 for non-existent agent', async () => {
      const res = await request(app)
        .post('/api/agents/ag_nonexistent/chat')
        .send({ message: 'Hello!' })

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('agent not found')
    })

    it('should return 400 for missing message', async () => {
      const res = await request(app)
        .post(`/api/agents/${testAgent.id}/chat`)
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('validation error')
    })

    it('should return 400 for empty message', async () => {
      const res = await request(app)
        .post(`/api/agents/${testAgent.id}/chat`)
        .send({ message: '' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('validation error')
    })

    it('should return 404 for invalid conversation ID', async () => {
      const res = await request(app)
        .post(`/api/agents/${testAgent.id}/chat`)
        .send({ message: 'Hello!', conversationId: 'conv_invalid' })

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('conversation not found')
    })
  })

  describe('GET /api/agents/:id/conversations', () => {
    it('should return empty array when no conversations exist', async () => {
      const res = await request(app)
        .get(`/api/agents/${testAgent.id}/conversations`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('should return 404 for non-existent agent', async () => {
      const res = await request(app)
        .get('/api/agents/ag_nonexistent/conversations')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('agent not found')
    })
  })

  describe('GET /api/agents/:id/conversations/:convId', () => {
    it('should return conversation with messages', async () => {
      // Create a conversation manually
      const conv = conversationService.createConversation(testAgent.id)
      conversationService.addMessage(conv.id, 'user', 'Test message')
      conversationService.addMessage(conv.id, 'agent', 'Test response')

      const res = await request(app)
        .get(`/api/agents/${testAgent.id}/conversations/${conv.id}`)

      expect(res.status).toBe(200)
      expect(res.body.id).toBe(conv.id)
      expect(res.body.agentId).toBe(testAgent.id)
      expect(res.body.messages).toHaveLength(2)
      expect(res.body.messages[0].role).toBe('user')
      expect(res.body.messages[1].role).toBe('agent')

      // Cleanup
      conversationService.deleteConversation(conv.id)
    })

    it('should return 404 for non-existent conversation', async () => {
      const res = await request(app)
        .get(`/api/agents/${testAgent.id}/conversations/conv_nonexistent`)

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('conversation not found')
    })

    it('should return 400 when conversation belongs to different agent', async () => {
      // Create a conversation for a different agent
      const conv = conversationService.createConversation('ag_different')

      const res = await request(app)
        .get(`/api/agents/${testAgent.id}/conversations/${conv.id}`)

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('conversation does not belong to this agent')

      // Cleanup
      conversationService.deleteConversation(conv.id)
    })
  })

  describe('DELETE /api/agents/:id/conversations/:convId', () => {
    it('should delete conversation', async () => {
      // Create a conversation
      const conv = conversationService.createConversation(testAgent.id)

      const res = await request(app)
        .delete(`/api/agents/${testAgent.id}/conversations/${conv.id}`)

      expect(res.status).toBe(204)

      // Verify deleted
      const getRes = await request(app)
        .get(`/api/agents/${testAgent.id}/conversations/${conv.id}`)
      expect(getRes.status).toBe(404)
    })

    it('should return 404 for non-existent conversation', async () => {
      const res = await request(app)
        .delete(`/api/agents/${testAgent.id}/conversations/conv_nonexistent`)

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('conversation not found')
    })
  })

  describe('GET /api/agents/models', () => {
    it('should return all supported models', async () => {
      const res = await request(app)
        .get('/api/agents/models')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('available')
      expect(res.body).toHaveProperty('all')
      expect(res.body.all).toHaveProperty('openai')
      expect(res.body.all).toHaveProperty('anthropic')
      expect(Array.isArray(res.body.all.openai)).toBe(true)
      expect(Array.isArray(res.body.all.anthropic)).toBe(true)
    })
  })

  describe('Agent with LLM fields', () => {
    it('should create agent with LLM configuration', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'LLM Agent',
          skills: ['coding'],
          systemPrompt: 'You are a coding assistant.',
          model: 'gpt-4o',
          temperature: 0.5,
          maxTokens: 2048
        })

      expect(res.status).toBe(201)
      expect(res.body.name).toBe('LLM Agent')
      expect(res.body.systemPrompt).toBe('You are a coding assistant.')
      expect(res.body.model).toBe('gpt-4o')
      expect(res.body.temperature).toBe(0.5)
      expect(res.body.maxTokens).toBe(2048)

      // Cleanup
      await storage.delete(res.body.id)
    })

    it('should use default model for invalid model', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Default Model Agent',
          skills: [],
          model: 'invalid-model'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('validation error')
    })

    it('should reject temperature out of range', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Bad Temp Agent',
          skills: [],
          temperature: 3.0
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('validation error')
    })

    it('should reject maxTokens out of range', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Bad Tokens Agent',
          skills: [],
          maxTokens: 10000
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('validation error')
    })

    it('should update agent LLM settings', async () => {
      // Update the test agent's LLM settings
      const res = await request(app)
        .put(`/api/agents/${testAgent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          systemPrompt: 'Updated system prompt',
          temperature: 0.3,
          maxTokens: 512
        })

      expect(res.status).toBe(200)
      expect(res.body.systemPrompt).toBe('Updated system prompt')
      expect(res.body.temperature).toBe(0.3)
      expect(res.body.maxTokens).toBe(512)
    })
  })
})
