import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * TagInput Component
 * 
 * A tag/chip input for entering multiple values (e.g., skills).
 * User types and presses Enter to add tags, can click X to remove.
 * 
 * @param {string[]} value - Array of current tags
 * @param {function} onChange - Called with updated array when tags change
 * @param {string[]} suggestions - Optional list of suggestions to show
 * @param {string} placeholder - Input placeholder text
 * @param {string} label - Field label
 * @param {string} hint - Helper text below input
 */

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
  'Data Analysis', 'Machine Learning', 'API Design', 'Testing',
  'Documentation', 'Code Review', 'Debugging', 'Architecture'
]

export default function TagInput({
  value = [],
  onChange,
  suggestions = SKILL_SUGGESTIONS,
  placeholder = 'Type and press Enter to add...',
  label,
  hint,
  className,
}) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  // Filter suggestions based on input and exclude already selected
  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
  ).slice(0, 6)

  const addTag = (tag) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag when backspace on empty input
      removeTag(value[value.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setShowSuggestions(e.target.value.length > 0)
  }

  const handleFocus = () => {
    if (inputValue.length > 0 || value.length === 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => setShowSuggestions(false), 150)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Tags Container */}
        <div className="min-h-[42px] p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-colors">
          <div className="flex flex-wrap gap-2">
            {/* Existing Tags */}
            <AnimatePresence mode="popLayout">
              {value.map((tag) => (
                <motion.span
                  key={tag}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors"
                    aria-label={`Remove ${tag}`}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            
            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={value.length === 0 ? placeholder : 'Add more...'}
              className="flex-1 min-w-[120px] outline-none text-sm bg-transparent py-1"
            />
          </div>
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs text-gray-500 mb-2 px-2">Suggestions</p>
                <div className="flex flex-wrap gap-1.5">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addTag(suggestion)}
                      className="px-2.5 py-1 text-sm bg-gray-100 hover:bg-primary-100 hover:text-primary-800 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hint && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
}
