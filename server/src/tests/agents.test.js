const request = require('supertest')
const createApp = require('../app')
const storage = require('../storage')

describe('Agent API', () => {
  let app
  let adminToken
  let editorToken
  let viewerToken
  let adminUser
  let editorUser
  let viewerUser

  beforeAll(async () => {
    app = createApp()

    // Create admin user
    const adminRegRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'admin123' })
    adminUser = adminRegRes.body
    
    // Update admin roles
    await storage.update(adminUser.id, { roles: ['admin', 'editor', 'viewer'] })
    
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' })
    adminToken = adminLoginRes.body.token

    // Create editor user
    const editorRegRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'editor', password: 'editor123' })
    editorUser = editorRegRes.body

    await storage.update(editorUser.id, { roles: ['editor', 'viewer'] })

    const editorLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'editor', password: 'editor123' })
    editorToken = editorLoginRes.body.token

    // Create viewer user
    const viewerRegRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'viewer', password: 'viewer123' })
    viewerUser = viewerRegRes.body

    await storage.update(viewerUser.id, { roles: ['viewer'] })

    const viewerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'viewer', password: 'viewer123' })
    viewerToken = viewerLoginRes.body.token
  })

  afterAll(async () => {
    // Cleanup users
    await storage.delete(adminUser.id)
    await storage.delete(editorUser.id)
    await storage.delete(viewerUser.id)
  })

  afterEach(async () => {
    // Clear agents after each test
    const all = await storage.getAll()
    const agents = all.filter(item => item.type === 'agent')
    for (const agent of agents) {
      await storage.delete(agent.id)
    }
  })

  describe('GET /api/agents', () => {
    it('should return all agents', async () => {
      // Create test agents
      await storage.create({ type: 'agent', name: 'Agent 1', skills: [], roles: [] })
      await storage.create({ type: 'agent', name: 'Agent 2', skills: [], roles: [] })

      const res = await request(app)
        .get('/api/agents')
        .expect(200)

      expect(Array.isArray(res.body)).toBe(true)
      // Will include users and agents, filter for agents
      const agents = res.body.filter(item => item.type === 'agent')
      expect(agents.length).toBe(2)
    })
  })

  describe('GET /api/agents/:id', () => {
    let agentId

    beforeEach(async () => {
      const agent = await storage.create({ 
        type: 'agent',
        name: 'Test Agent',
        skills: [],
        roles: []
      })
      agentId = agent.id
    })

    it('should return agent by id', async () => {
      const res = await request(app)
        .get(`/api/agents/${agentId}`)
        .expect(200)

      expect(res.body).toHaveProperty('id', agentId)
      expect(res.body).toHaveProperty('name', 'Test Agent')
    })

    it('should return 404 for non-existent agent', async () => {
      const res = await request(app)
        .get('/api/agents/ag_nonexistent999')
        .expect(404)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('POST /api/agents', () => {
    const validAgent = {
      name: 'New Agent',
      skills: ['coding', 'testing'],
      roles: []
    }

    it('should create agent with editor role', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(validAgent)
        .expect(201)

      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('name', validAgent.name)
      expect(res.body.id).toMatch(/^ag_/)
    })

    it('should create agent with admin role', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validAgent)
        .expect(201)

      expect(res.body).toHaveProperty('id')
    })

    it('should reject creation with viewer role', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(validAgent)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    it('should reject creation without authentication', async () => {
      const res = await request(app)
        .post('/api/agents')
        .send(validAgent)
        .expect(401)

      expect(res.body).toHaveProperty('error')
    })

    it('should reject creation with missing required fields', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ skills: ['test'] })
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/agents/:id', () => {
    let agentId

    beforeEach(async () => {
      const agent = await storage.create({ 
        type: 'agent',
        name: 'Original Name',
        skills: [],
        roles: []
      })
      agentId = agent.id
    })

    it('should update agent with editor role', async () => {
      const res = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ name: 'Updated Name' })
        .expect(200)

      expect(res.body).toHaveProperty('name', 'Updated Name')
    })

    it('should update agent with admin role', async () => {
      const res = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Updated' })
        .expect(200)

      expect(res.body).toHaveProperty('name', 'Admin Updated')
    })

    it('should reject update by viewer', async () => {
      const res = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ name: 'Viewer Update' })
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    it('should return 404 for non-existent agent', async () => {
      const res = await request(app)
        .put('/api/agents/ag_nonexistent999')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ name: 'Updated' })
        .expect(404)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/agents/:id', () => {
    let agentId

    beforeEach(async () => {
      const agent = await storage.create({ 
        type: 'agent',
        name: 'To Delete',
        skills: [],
        roles: []
      })
      agentId = agent.id
    })

    it('should delete agent with admin role', async () => {
      const res = await request(app)
        .delete(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204)

      // Verify agent is deleted
      const agent = await storage.getById(agentId)
      expect(agent).toBeNull()
    })

    it('should reject delete by editor', async () => {
      const res = await request(app)
        .delete(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    it('should reject delete by viewer', async () => {
      const res = await request(app)
        .delete(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    it('should return 404 for non-existent agent', async () => {
      const res = await request(app)
        .delete('/api/agents/ag_nonexistent999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)

      expect(res.body).toHaveProperty('error')
    })
  })
})
