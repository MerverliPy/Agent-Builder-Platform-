import React, { createContext, useContext, useEffect, useState } from 'react'
import { decodePayload } from '../utils/jwt'

const AuthContext = createContext({ token: null, user: null, login: () => {}, logout: () => {} })

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return window.localStorage.getItem('cabp_token') } catch (err) { return null }
  })
  const [user, setUser] = useState(() => decodePayload(token))

  useEffect(() => {
    try {
      if (token) {
        window.localStorage.setItem('cabp_token', token)
        setUser(decodePayload(token))
      } else {
        window.localStorage.removeItem('cabp_token')
        setUser(null)
      }
    } catch (err) {
      // ignore
    }
  }, [token])

  function login(newToken) {
    setToken(newToken)
  }

  function logout() {
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
