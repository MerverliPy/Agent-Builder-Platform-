import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const navigate = useNavigate()
  const { token, user, logout } = useAuth()

  function doLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="brand"><Link to="/">Agent Builder</Link></div>
        <nav className="nav">
          <Link to="/agents">Agents</Link>
          <Link to="/agents/new">Create</Link>
          {!token ? <Link to="/login">Sign in</Link> : <a href="#" onClick={(e)=>{e.preventDefault(); doLogout()}}>Sign out</a>}
        </nav>
        <div className="user-info">
          {user ? (
            <div>
              <strong>{user.username}</strong>
              {user.roles && user.roles.length ? <span className="roles"> — {user.roles.join(', ')}</span> : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
