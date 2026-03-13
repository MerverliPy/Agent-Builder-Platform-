import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

/**
 * MobileMenu Component
 * 
 * Mobile-responsive navigation menu with hamburger toggle.
 * Displays on small screens and includes all main navigation options.
 */

export const MobileMenu = ({ isOpen, onClose, onNavigate }) => {
  const { user, token, logout } = useAuth()

  const handleLogout = () => {
    logout()
    onNavigate('/login')
  }

  const navItems = [
    { label: 'Agents', path: '/agents' },
    { label: 'Templates', path: '/templates' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t border-neutral-200 bg-white"
        >
          <div className="px-4 py-4 space-y-4">
            {/* Navigation Links */}
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block text-base font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}

            <hr className="border-neutral-200" />

            {/* User Menu Items */}
            {token && user ? (
              <>
                <Link
                  to="/account"
                  className="block text-base font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                  onClick={onClose}
                >
                  Account
                </Link>
                <Link
                  to="/account"
                  className="block text-base font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                  onClick={onClose}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    onClose()
                  }}
                  className="w-full text-left text-base font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block text-base font-medium text-primary-600 hover:text-primary-700 transition-colors"
                onClick={onClose}
              >
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileMenu
