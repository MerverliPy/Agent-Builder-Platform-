import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * NavLinks Component
 * 
 * Main navigation links with active state indicator.
 * Displays: Agents, Templates
 */

export const NavLinks = ({ className }) => {
  const location = useLocation()

  const navItems = [
    { label: 'Agents', path: '/agents' },
    { label: 'Templates', path: '/templates' },
    { label: 'Reviews', path: '/reviews' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className={cn('hidden md:flex items-center gap-8', className)}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'text-sm font-medium transition-colors relative py-2',
            isActive(item.path)
              ? 'text-primary-600'
              : 'text-neutral-600 hover:text-neutral-900'
          )}
        >
          {item.label}
          {isActive(item.path) && (
            <motion.div
              layoutId="activeNav"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              initial={false}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </Link>
      ))}
    </nav>
  )
}

export default NavLinks
