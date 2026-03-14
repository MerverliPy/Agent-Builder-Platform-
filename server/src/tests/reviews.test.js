const request = require('supertest')
const createApp = require('../app')
const reviewStorage = require('../storage/reviewStorage')
const { REVIEW_STATUS, REVIEW_TYPES, REVIEW_PRIORITY } = require('../models/reviewModel')

describe('Review System', () => {
  let app
  let adminToken
  let reviewerToken
  let editorToken

  beforeEach(async () => {
    app = createApp()
    
    // Clear review storage
    await reviewStorage.clear()
    
    // Create test users and get tokens
    // Admin user
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'admin123' })
    
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' })
    
    adminToken = adminLogin.body.token
    
    // Reviewer user
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'reviewer', password: 'reviewer123' })
    
    // Grant reviewer role (in production this would be done through admin API)
    const reviewerLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'reviewer', password: 'reviewer123' })
    
    reviewerToken = reviewerLogin.body.token
    
    // Editor user
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'editor', password: 'editor123' })
    
    const editorLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'editor', password: 'editor123' })
    
    editorToken = editorLogin.body.token
  })

  describe('POST /api/reviews', () => {
    it('should create a review item', async () => {
      const reviewData = {
        type: REVIEW_TYPES.AGENT_CREATION,
        itemType: 'agent',
        itemData: { name: 'Test Agent', skills: ['api'] },
        reason: 'Agent has external API integration',
        submittedBy: 'user123',
        policyRules: ['external_api_integration']
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reviewData)
        .expect(201)

      expect(response.body.id).toBeDefined()
      expect(response.body.status).toBe(REVIEW_STATUS.PENDING)
      expect(response.body.type).toBe(REVIEW_TYPES.AGENT_CREATION)
      expect(response.body.reason).toBe(reviewData.reason)
    })

    it('should reject review with missing required fields', async () => {
      const invalidData = {
        type: REVIEW_TYPES.AGENT_CREATION
        // missing itemType, reason, submittedBy
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body.error).toBe('Invalid review item')
      expect(response.body.details).toBeInstanceOf(Array)
    })

    it('should require authentication', async () => {
      await request(app)
        .post('/api/reviews')
        .send({})
        .expect(401)
    })
  })

  describe('GET /api/reviews', () => {
    beforeEach(async () => {
      // Create some test reviews
      await reviewStorage.create({
        type: REVIEW_TYPES.AGENT_CREATION,
        status: REVIEW_STATUS.PENDING,
        priority: REVIEW_PRIORITY.HIGH,
        itemType: 'agent',
        itemData: { name: 'Agent 1' },
        reason: 'Test reason 1',
        submittedBy: 'user1',
        policyRules: ['rule1']
      })

      await reviewStorage.create({
        type: REVIEW_TYPES.AGENT_UPDATE,
        status: REVIEW_STATUS.APPROVED,
        priority: REVIEW_PRIORITY.MEDIUM,
        itemType: 'agent',
        itemData: { name: 'Agent 2' },
        reason: 'Test reason 2',
        submittedBy: 'user2',
        policyRules: ['rule2']
      })

      await reviewStorage.create({
        type: REVIEW_TYPES.AGENT_DELETION,
        status: REVIEW_STATUS.REJECTED,
        priority: REVIEW_PRIORITY.LOW,
        itemType: 'agent',
        itemData: { name: 'Agent 3' },
        reason: 'Test reason 3',
        submittedBy: 'user3',
        policyRules: ['rule3']
      })
    })

    it('should list all reviews for reviewers', async () => {
      const response = await request(app)
        .get('/api/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toBe(3)
    })

    it('should filter reviews by status', async () => {
      const response = await request(app)
        .get('/api/reviews?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.length).toBe(1)
      expect(response.body[0].status).toBe(REVIEW_STATUS.PENDING)
    })

    it('should filter reviews by type', async () => {
      const response = await request(app)
        .get('/api/reviews?type=agent_update')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.length).toBe(1)
      expect(response.body[0].type).toBe(REVIEW_TYPES.AGENT_UPDATE)
    })

    it('should filter reviews by priority', async () => {
      const response = await request(app)
        .get('/api/reviews?priority=high')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.length).toBe(1)
      expect(response.body[0].priority).toBe(REVIEW_PRIORITY.HIGH)
    })
  })

  describe('GET /api/reviews/:id', () => {
    let reviewId

    beforeEach(async () => {
      const review = await reviewStorage.create({
        type: REVIEW_TYPES.AGENT_CREATION,
        status: REVIEW_STATUS.PENDING,
        priority: REVIEW_PRIORITY.HIGH,
        itemType: 'agent',
        itemData: { name: 'Test Agent' },
        reason: 'Test reason',
        submittedBy: 'user1',
        policyRules: ['rule1']
      })
      reviewId = review.id
    })

    it('should get a single review by ID', async () => {
      const response = await request(app)
        .get(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.id).toBe(reviewId)
      expect(response.body.status).toBe(REVIEW_STATUS.PENDING)
    })

    it('should return 404 for non-existent review', async () => {
      await request(app)
        .get('/api/reviews/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
    })
  })

  describe('POST /api/reviews/:id/decision', () => {
    let reviewId

    beforeEach(async () => {
      const review = await reviewStorage.create({
        type: REVIEW_TYPES.AGENT_CREATION,
        status: REVIEW_STATUS.PENDING,
        priority: REVIEW_PRIORITY.HIGH,
        itemType: 'agent',
        itemData: { name: 'Test Agent' },
        reason: 'Test reason',
        submittedBy: 'user1',
        policyRules: ['rule1']
      })
      reviewId = review.id
    })

    it('should approve a pending review', async () => {
      const response = await request(app)
        .post(`/api/reviews/${reviewId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          decision: 'approve',
          notes: 'Looks good'
        })
        .expect(200)

      expect(response.body.review.status).toBe(REVIEW_STATUS.APPROVED)
      expect(response.body.review.reviewNotes).toBe('Looks good')
      expect(response.body.review.reviewedBy).toBeDefined()
      expect(response.body.review.reviewedAt).toBeDefined()
      expect(response.body.decision.made).toBe('approve')
    })

    it('should reject a pending review', async () => {
      const response = await request(app)
        .post(`/api/reviews/${reviewId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          decision: 'reject',
          notes: 'Security concern'
        })
        .expect(200)

      expect(response.body.review.status).toBe(REVIEW_STATUS.REJECTED)
      expect(response.body.review.reviewNotes).toBe('Security concern')
    })

    it('should request revision on a pending review', async () => {
      const response = await request(app)
        .post(`/api/reviews/${reviewId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          decision: 'request_revision',
          notes: 'Needs changes',
          revisionNotes: 'Please remove external API access'
        })
        .expect(200)

      expect(response.body.review.status).toBe(REVIEW_STATUS.REVISION_REQUESTED)
      expect(response.body.review.reviewNotes).toBe('Needs changes')
      expect(response.body.review.revisionNotes).toBe('Please remove external API access')
    })

    it('should reject invalid decision', async () => {
      const response = await request(app)
        .post(`/api/reviews/${reviewId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          decision: 'invalid_decision'
        })
        .expect(400)

      expect(response.body.error).toBe('Invalid decision')
    })

    it('should reject decision on already approved review', async () => {
      // First approve the review
      await request(app)
        .post(`/api/reviews/${reviewId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'approve' })

      // Try to make another decision
      const response = await request(app)
        .post(`/api/reviews/${reviewId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'reject' })
        .expect(400)

      expect(response.body.error).toBe('Invalid status transition')
    })
  })

  describe('POST /api/reviews/:id/resubmit', () => {
    let reviewId

    beforeEach(async () => {
      const review = await reviewStorage.create({
        type: REVIEW_TYPES.AGENT_CREATION,
        status: REVIEW_STATUS.REVISION_REQUESTED,
        priority: REVIEW_PRIORITY.HIGH,
        itemType: 'agent',
        itemData: { name: 'Test Agent', skills: ['api'] },
        reason: 'Test reason',
        submittedBy: 'user1',
        policyRules: ['rule1'],
        revisionNotes: 'Remove API access'
      })
      reviewId = review.id
    })

    it('should resubmit a review with revision_requested status', async () => {
      const response = await request(app)
        .post(`/api/reviews/${reviewId}/resubmit`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          itemData: { name: 'Test Agent', skills: [] },
          notes: 'Removed API access as requested'
        })
        .expect(200)

      expect(response.body.status).toBe(REVIEW_STATUS.PENDING)
      expect(response.body.itemData.skills).toEqual([])
      expect(response.body.metadata.resubmissionNotes).toBe('Removed API access as requested')
    })

    it('should reject resubmit for non-revision_requested status', async () => {
      // Change status to pending
      await reviewStorage.update(reviewId, { status: REVIEW_STATUS.PENDING })

      const response = await request(app)
        .post(`/api/reviews/${reviewId}/resubmit`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ itemData: {} })
        .expect(400)

      expect(response.body.error).toBe('Invalid resubmission')
    })
  })

  describe('GET /api/reviews/stats', () => {
    beforeEach(async () => {
      // Create various reviews
      await reviewStorage.create({
        type: REVIEW_TYPES.AGENT_CREATION,
        status: REVIEW_STATUS.PENDING,
        priority: REVIEW_PRIORITY.HIGH,
        itemType: 'agent',
        itemData: {},
        reason: 'Test',
        submittedBy: 'user1',
        policyRules: []
      })

      await reviewStorage.create({
        type: REVIEW_TYPES.AGENT_CREATION,
        status: REVIEW_STATUS.PENDING,
        priority: REVIEW_PRIORITY.MEDIUM,
        itemType: 'agent',
        itemData: {},
        reason: 'Test',
        submittedBy: 'user1',
        policyRules: []
      })

      await reviewStorage.create({
        type: REVIEW_TYPES.AGENT_UPDATE,
        status: REVIEW_STATUS.APPROVED,
        priority: REVIEW_PRIORITY.LOW,
        itemType: 'agent',
        itemData: {},
        reason: 'Test',
        submittedBy: 'user1',
        policyRules: []
      })
    })

    it('should return review statistics', async () => {
      const response = await request(app)
        .get('/api/reviews/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.total).toBe(3)
      expect(response.body.pending).toBe(2)
      expect(response.body.approved).toBe(1)
      expect(response.body.byType.agent_creation).toBe(2)
      expect(response.body.byType.agent_update).toBe(1)
    })
  })

  describe('DELETE /api/reviews/:id', () => {
    let reviewId

    beforeEach(async () => {
      const review = await reviewStorage.create({
        type: REVIEW_TYPES.AGENT_CREATION,
        status: REVIEW_STATUS.PENDING,
        priority: REVIEW_PRIORITY.HIGH,
        itemType: 'agent',
        itemData: {},
        reason: 'Test',
        submittedBy: 'user1',
        policyRules: []
      })
      reviewId = review.id
    })

    it('should delete a review (admin only)', async () => {
      await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      const deleted = await reviewStorage.getById(reviewId)
      expect(deleted).toBeNull()
    })

    it('should return 404 for non-existent review', async () => {
      await request(app)
        .delete('/api/reviews/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
    })
  })
})
