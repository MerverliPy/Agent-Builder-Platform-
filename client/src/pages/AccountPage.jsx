import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AccountPage() {
  const { token, user, logout } = useAuth()
  const [serverUser, setServerUser] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let mounted = true
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
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
    const current = e.target.current.value
    const next = e.target.next.value
    try {
      const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currentPassword: current, newPassword: next }) })
      if (!res.ok) {
        const b = await res.json().catch(()=>({error:'failed'}))
        setStatus(b.error || 'change failed')
        return
      }
      setStatus('password changed')
      e.target.reset()
    } catch (err) { setStatus(err.message) }
  }

  if (!user) return <div className="container">Sign in to view account</div>

  return (
    <div className="container">
      <h2>Account</h2>
      <div><strong>Token user:</strong> {user.username} • roles: {(user.roles||[]).join(', ')}</div>
      <div>{serverUser ? <div><strong>Server user:</strong> {serverUser.username} • id: {serverUser.id}</div> : <div>Loading server info...</div>}</div>
      <h3>Change password</h3>
      <form onSubmit={handleChangePassword} className="form">
        <label>Current<br /><input name="current" type="password" /></label>
        <label>New<br /><input name="next" type="password" /></label>
        <p><button className="btn">Change</button></p>
      </form>
      <p><button className="btn" onClick={()=>{ logout(); window.location.href='/' }}>Sign out</button></p>
      {status && <div className="field-error">{status}</div>}
    </div>
  )
}
