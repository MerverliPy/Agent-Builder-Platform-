const request = require('supertest')
const createApp = require('../app')
const storage = require('../storage')

describe('Auth API', () => {
  let app

  beforeAll(() => {
    app = createApp()
  })

  afterEach(async () => {
    // Clear all test users after each test
    const all = await storage.getAll()
    const users = all.filter(item => item.type === 'user')
    for (const user of users) {
      await storage.delete(user.id)
    }
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' })
        .expect(201)

      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('username', 'testuser')
      expect(res.body).toHaveProperty('roles')
    })

    it('should reject registration with existing username', async () => {
      // Create a user first
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'existinguser', password: 'password123' })
        .expect(201)

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'existinguser', password: 'password123' })
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain('exists')
    })

    it('should reject registration with missing username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123' })
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })

    it('should reject registration with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' })
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })

    it('should assign empty roles by default', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' })
        .expect(201)

      expect(Array.isArray(res.body.roles)).toBe(true)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' })
    })

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' })
        .expect(200)

      expect(res.body).toHaveProperty('token')
      expect(res.body).toHaveProperty('expiresIn')
      expect(typeof res.body.token).toBe('string')
    })

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' })
        .expect(401)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain('invalid')
    })

    it('should reject login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' })
        .expect(401)

      expect(res.body).toHaveProperty('error')
    })

    it('should reject login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' })
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('GET /api/auth/me', () => {
    let token

    beforeEach(async () => {
      // Create user and get token
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' })
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' })
      token = res.body.token
    })

    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body).toHaveProperty('username', 'testuser')
      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('roles')
      expect(res.body).not.toHaveProperty('passwordHash')
    })

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(res.body).toHaveProperty('error')
    })

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('POST /api/auth/change-password', () => {
    let token

    beforeEach(async () => {
      // Create user and get token
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'oldpassword123' })
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'oldpassword123' })
      token = res.body.token
    })

    it('should change password with correct current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          currentPassword: 'oldpassword123', 
          newPassword: 'newpassword123' 
        })
        .expect(204)

      // Verify can login with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'newpassword123' })
        .expect(200)
      
      expect(loginRes.body).toHaveProperty('token')
    })

    it('should reject password change with incorrect current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          currentPassword: 'wrongpassword', 
          newPassword: 'newpassword123' 
        })
        .expect(401)

      expect(res.body).toHaveProperty('error')
    })

    it('should reject password change without token', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .send({ 
          currentPassword: 'oldpassword123', 
          newPassword: 'newpassword123' 
        })
        .expect(401)

      expect(res.body).toHaveProperty('error')
    })

    it('should reject password change with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'oldpassword123' })
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })
})
