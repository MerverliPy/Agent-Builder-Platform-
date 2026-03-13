import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Container, Section, Card, Input, Button, Badge, Stack } from '../components/ui'
import { fadeIn, slideUp } from '../lib/animations'
import { API_BASE } from '../config/api'

export default function AccountPage() {
  const { token, user, logout } = useAuth()
  const [serverUser, setServerUser] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function fetchMe() {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('failed')
        const j = await res.json()
        if (mounted) setServerUser(j)
      } catch (err) {
        if (mounted) setServerUser(null)
      }
    }
    if (token) fetchMe()
    return () => { mounted = false }
  }, [token])

  async function handleChangePassword(e) {
    e.preventDefault()
    const current = e.target.elements.current.value
    const next = e.target.elements.next.value
    
    setStatus(null)
    setLoading(true)
    
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        }, 
        body: JSON.stringify({ currentPassword: current, newPassword: next }) 
      })
      
      if (!res.ok) {
        const b = await res.json().catch(()=>({error:'failed'}))
        setStatus({ type: 'error', message: b.error || 'change failed' })
        return
      }
      
      setStatus({ type: 'success', message: 'Password changed successfully' })
      e.target.reset()
    } catch (err) { 
      setStatus({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    window.location.href = '/'
  }

  if (!user) {
    return (
      <Section className="py-12 min-h-[calc(100vh-4rem)] flex items-center">
        <Container size="sm">
          <Card>
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in required</h2>
              <p className="text-gray-600 mb-6">You need to sign in to view your account</p>
              <Button href="/login">Sign in</Button>
            </div>
          </Card>
        </Container>
      </Section>
    )
  }

  return (
    <Section className="py-12">
      <Container size="md">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your account information and security</p>
          </div>

          {/* User Information Card */}
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">User Information</h2>
              <p className="text-gray-600">Your account details and roles</p>
            </div>
            <div>
              <Stack spacing={4}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="text-lg font-semibold text-gray-900">{user.username}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {(user.roles || []).length > 0 ? (
                      user.roles.map(role => (
                        <Badge key={role} variant="primary">{role}</Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">No roles assigned</Badge>
                    )}
                  </div>
                </div>

                {serverUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                    <div className="font-mono text-sm text-gray-600">{serverUser.id}</div>
                  </div>
                )}

                {!serverUser && (
                  <div className="text-sm text-gray-500">Loading server information...</div>
                )}
              </Stack>
            </div>
          </Card>

          {/* Change Password Card */}
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Change Password</h2>
              <p className="text-gray-600">Update your account password</p>
            </div>
            <div>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <Input
                  label="Current Password"
                  type="password"
                  name="current"
                  placeholder="Enter your current password"
                  required
                  autoComplete="current-password"
                />

                <Input
                  label="New Password"
                  type="password"
                  name="next"
                  placeholder="Enter your new password"
                  required
                  autoComplete="new-password"
                />

                {status && (
                  <motion.div
                    variants={slideUp}
                    initial="initial"
                    animate="animate"
                    className={`p-4 rounded-lg text-sm ${
                      status.type === 'error' 
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : 'bg-green-50 border border-green-200 text-green-700'
                    }`}
                  >
                    {status.message}
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  loading={loading}
                  disabled={loading}
                >
                  Change Password
                </Button>
              </form>
            </div>
          </Card>

          {/* Sign Out Card */}
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign Out</h2>
              <p className="text-gray-600">End your current session</p>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </Card>
        </motion.div>
      </Container>
    </Section>
  )
}
