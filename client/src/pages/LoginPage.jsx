import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Container, Section, Card, Input, Button } from '../components/ui'
import { fadeIn, slideUp } from '../lib/animations'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ username, password }) 
      })
      
      if (!res.ok) {
        const b = await res.json().catch(()=>({error:'failed'}))
        setErr(b.error || 'login failed')
        return
      }
      
      const data = await res.json()
      login(data.token)
      window.location.href = '/agents'
    } catch (err) {
      setErr(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section className="py-12 min-h-[calc(100vh-4rem)] flex items-center">
      <Container size="sm">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Login Card */}
          <Card>
            <Card.Content className="p-8">
              <form onSubmit={submit} className="space-y-6">
                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />

                {err && (
                  <motion.div
                    variants={slideUp}
                    initial="initial"
                    animate="animate"
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    {err}
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  loading={loading}
                  disabled={loading}
                >
                  Sign in
                </Button>
              </form>
            </Card.Content>
          </Card>

          {/* Footer Note */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account? Contact your administrator.
          </p>
        </motion.div>
      </Container>
    </Section>
  )
}
