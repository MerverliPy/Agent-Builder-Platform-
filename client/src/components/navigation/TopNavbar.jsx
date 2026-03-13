import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../ui/Container'
import { NavLinks } from './NavLinks'
import { SearchInput } from './SearchInput'
import { UserMenu } from './UserMenu'
import { MobileMenu } from './MobileMenu'

/**
 * TopNavbar Component
 * 
 * Main product navigation shell combining:
 * - Logo area on the left
 * - Main navigation links (Agents, Templates)
 * - Global search input
 * - Command palette trigger hint
 * - User menu on the right
 * - Mobile hamburger menu for small screens
 * 
 * This is the primary navigation for authenticated and guest users.
 */

export const TopNavbar = () => {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleSearchFocus = () => {
    // Placeholder for command palette trigger
    // In a future phase, this will open the command palette
  }

  const handleMobileMenuNavigate = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 backdrop-blur-lg bg-white/95">
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo Area */}
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                CA
              </div>
              <span className="hidden sm:inline text-lg font-bold text-neutral-900">
                Agent Builder
              </span>
            </Link>

            {/* Main Navigation Links */}
            <NavLinks className="flex-1 ml-12" />

            {/* Center/Right: Search + Command Palette + User Menu */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Global Search Input */}
              <SearchInput onFocus={handleSearchFocus} />

              {/* Command Palette Trigger (for smaller screens) */}
              <button
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                onClick={handleSearchFocus}
                title="Open command palette"
              >
                <span>Cmd</span>
                <span className="text-neutral-400">+</span>
                <span>K</span>
              </button>

              {/* User Menu */}
              <UserMenu />

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                title="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={handleMobileMenuNavigate}
      />
    </>
  )
}

export default TopNavbar
