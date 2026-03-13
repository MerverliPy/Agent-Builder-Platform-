import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

/**
 * UserMenu Component
 * 
 * User account menu with Account, Settings, and Logout options.
 * Displays avatar for authenticated users, or Sign In/Get Started buttons for guests.
 */

export const UserMenu = ({ className }) => {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {token && user ? (
        <div className="relative" ref={menuRef}>
          {/* Avatar Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex md:flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="User menu"
            data-testid="user-menu-button"
          >
            <Avatar
              name={user.username}
              size="sm"
              className="cursor-pointer"
            />
            <span className="hidden sm:inline text-sm font-medium text-neutral-700">
              {user.username}
            </span>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
              <Link
                to="/account"
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Account
              </Link>
              <Link
                to="/account"
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Link>
              <hr className="my-1 border-neutral-200" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                data-testid="logout-button"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="hidden md:inline-flex"
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/login')}
            className="hidden md:inline-flex"
          >
            Get Started
          </Button>
        </>
      )}
    </div>
  )
}

export default UserMenu
