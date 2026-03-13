import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * ChipSelect Component
 * 
 * A chip-based multi-select with preset options and custom entry.
 * Users can click preset chips to toggle selection or add custom values.
 * 
 * @param {string[]} value - Array of currently selected values
 * @param {function} onChange - Called with updated array when selection changes
 * @param {string[]} presets - Preset options to display as chips
 * @param {boolean} allowCustom - Whether to allow custom value entry
 * @param {string} label - Field label
 * @param {string} hint - Helper text below input
 */

const DEFAULT_ROLE_PRESETS = [
  'Developer',
  'Researcher', 
  'Assistant',
  'Analyst',
  'Designer',
  'Manager',
  'Admin',
]

export default function ChipSelect({
  value = [],
  onChange,
  presets = DEFAULT_ROLE_PRESETS,
  allowCustom = true,
  label,
  hint,
  placeholder = 'Add custom role...',
  className,
}) {
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const togglePreset = (preset) => {
    if (value.includes(preset)) {
      onChange(value.filter(v => v !== preset))
    } else {
      onChange([...value, preset])
    }
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setCustomInput('')
    setShowCustomInput(false)
  }

  const handleCustomKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustom()
    } else if (e.key === 'Escape') {
      setShowCustomInput(false)
      setCustomInput('')
    }
  }

  const removeCustom = (item) => {
    onChange(value.filter(v => v !== item))
  }

  // Get custom values (values not in presets)
  const customValues = value.filter(v => !presets.includes(v))

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isSelected = value.includes(preset)
          return (
            <motion.button
              key={preset}
              type="button"
              onClick={() => togglePreset(preset)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-150',
                isSelected
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
              )}
            >
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block mr-1"
                >
                  ✓
                </motion.span>
              )}
              {preset}
            </motion.button>
          )
        })}

        {/* Add Custom Button */}
        {allowCustom && !showCustomInput && (
          <motion.button
            type="button"
            onClick={() => setShowCustomInput(true)}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 text-sm font-medium rounded-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
          >
            + Custom
          </motion.button>
        )}
      </div>

      {/* Custom Input Field */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleCustomKeyDown}
              placeholder={placeholder}
              autoFocus
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!customInput.trim()}
              className="px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false)
                setCustomInput('')
              }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Values Display */}
      <AnimatePresence>
        {customValues.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2"
          >
            <span className="text-xs text-gray-500 self-center">Custom:</span>
            {customValues.map((item) => (
              <motion.span
                key={item}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeCustom(item)}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  aria-label={`Remove ${item}`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {hint && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
}
