import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import {
  HeroSection,
  QuickStartSection,
  RecentAgentsSection,
  CapabilitiesSection,
  Footer,
} from '../components/home'

/**
 * HomePage Component
 * 
 * Product-style landing workspace with hero, quick start, recent agents, 
 * capabilities, and footer sections.
 */
export default function HomePage() {
  const { token } = useAuth()
  const [systemStatus, setSystemStatus] = useState(null)

  useEffect(() => {
    let mounted = true
    api.ping()
      .then(s => mounted && setSystemStatus(s))
      .catch(() => mounted && setSystemStatus('down'))
    return () => { mounted = false }
  }, [])

  const isAuthenticated = !!token

  return (
    <>
      {/* Hero Section */}
      <HeroSection 
        isAuthenticated={isAuthenticated}
        systemStatus={systemStatus}
      />

      {/* Quick Start Section */}
      <QuickStartSection 
        isAuthenticated={isAuthenticated}
      />

      {/* Recent Agents Section */}
      {isAuthenticated && (
        <RecentAgentsSection 
          isAuthenticated={isAuthenticated}
          limit={3}
        />
      )}

      {/* Capabilities Section */}
      <CapabilitiesSection />

      {/* Footer */}
      <Footer isAuthenticated={isAuthenticated} />
    </>
  )
}
