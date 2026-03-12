import React, { useState } from 'react'

import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setErr(null)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
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
    }
  }

  return (
    <div className="container">
      <h2>Sign In</h2>
      <form onSubmit={submit} className="form">
        <label>Username<br /><input value={username} onChange={(e)=>setUsername(e.target.value)} /></label>
        <label>Password<br /><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
        <p><button className="btn">Sign in</button></p>
        {err && <div className="field-error">{err}</div>}
      </form>
    </div>
  )
}
