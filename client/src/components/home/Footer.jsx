import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Section } from '../ui/Container'

/**
 * Footer Component
 * 
 * Footer with navigation links: Docs, Account, Settings, System Status.
 */
export const Footer = ({ isAuthenticated }) => {
  const navigate = useNavigate()

  const links = [
    { label: 'Documentation', href: '#', external: true },
    isAuthenticated && { label: 'Account', onClick: () => navigate('/account') },
    isAuthenticated && { label: 'Settings', onClick: () => navigate('/account') },
    { label: 'Status', href: '#', external: true },
  ].filter(Boolean)

  return (
    <Section spacing="sm" className="bg-neutral-900 border-t border-neutral-800">
      <Container size="lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Branding */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Agent Builder Platform
            </h3>
            <p className="text-sm text-neutral-400">
              Build and manage custom AI agents
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href || '#'}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault()
                    link.onClick()
                  }
                }}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {link.label}
                {link.external && ' ↗'}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-sm text-neutral-500">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </Container>
    </Section>
  )
}

export default Footer
