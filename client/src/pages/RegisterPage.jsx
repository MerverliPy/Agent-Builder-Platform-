import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Container, Section, Card, Input, Button } from '../components/ui'
import { fadeIn, slideUp } from '../lib/animations'
import { API_BASE } from '../config/api'

export default function RegisterPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr(null)

    // Validation
    if (password !== confirmPassword) {
      setErr('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setErr('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    
    try {
      // Register the user
      const registerRes = await fetch(`${API_BASE}/auth/register`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ username, password, roles: ['viewer'] }) 
      })
      
      if (!registerRes.ok) {
        const b = await registerRes.json().catch(()=>({error:'failed'}))
        setErr(b.error || 'registration failed')
        return
      }

      // Auto-login after successful registration
      const loginRes = await fetch(`${API_BASE}/auth/login`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ username, password }) 
      })
      
      if (!loginRes.ok) {
        setErr('Registration successful! Please login.')
        setTimeout(() => window.location.href = '/login', 2000)
        return
      }
      
      const data = await loginRes.json()
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
            <p className="text-gray-600">Get started with your custom agent builder</p>
          </div>

          {/* Registration Card */}
          <Card>
            <div className="p-8">
              <form onSubmit={submit} className="space-y-6">
                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  autoComplete="username"
                  hint="Your unique identifier"
                  data-testid="register-username"
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  autoComplete="new-password"
                  hint="At least 6 characters"
                  data-testid="register-password"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  data-testid="register-confirm-password"
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

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  <p className="font-medium mb-1">New accounts start with viewer access</p>
                  <p className="text-xs text-blue-600">Contact an administrator to upgrade your permissions</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  data-testid="register-submit"
                >
                  Create account
                </Button>
              </form>
            </div>
          </Card>

          {/* Footer Note */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </Container>
    </Section>
  )
}
