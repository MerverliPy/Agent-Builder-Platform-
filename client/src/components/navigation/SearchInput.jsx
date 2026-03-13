import React from 'react'
import { cn } from '../../lib/utils'

/**
 * SearchInput Component
 * 
 * A search input with placeholder text and keyboard shortcut hint.
 * In this phase, it's a presentation component with no backend integration.
 */

export const SearchInput = ({ className, onFocus }) => {
  return (
    <div className={cn('relative hidden lg:flex items-center', className)}>
      <input
        type="text"
        placeholder="Search agents..."
        className="w-64 px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:outline-none focus:bg-white focus:border-primary-300 focus:ring-1 focus:ring-primary-200"
        onFocus={onFocus}
        readOnly
      />
      <div className="absolute right-3 text-xs font-medium text-neutral-400 pointer-events-none">
        ⌘K
      </div>
    </div>
  )
}

export default SearchInput
