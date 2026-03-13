import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * StyleSelector Component
 * 
 * A preset-based selector for response style with custom option.
 * Users select from predefined styles or enter a custom style.
 * 
 * @param {string} value - Currently selected style
 * @param {function} onChange - Called with selected style string
 * @param {string} label - Field label
 * @param {string} hint - Helper text below selector
 */

const STYLE_PRESETS = [
  {
    id: 'helpful-concise',
    label: 'Helpful and concise',
    description: 'Direct answers with essential information',
    icon: '💡',
  },
  {
    id: 'friendly-conversational',
    label: 'Friendly conversational',
    description: 'Warm, approachable, and engaging tone',
    icon: '😊',
  },
  {
    id: 'technical-expert',
    label: 'Technical expert',
    description: 'Detailed, precise, and professional',
    icon: '🔧',
  },
  {
    id: 'teacher-mentor',
    label: 'Teacher / mentor',
    description: 'Educational with explanations and guidance',
    icon: '📚',
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Define your own response style',
    icon: '✏️',
  },
]

export default function StyleSelector({
  value = '',
  onChange,
  label,
  hint,
  className,
}) {
  // Determine if current value matches a preset or is custom
  const matchingPreset = STYLE_PRESETS.find(
    p => p.id !== 'custom' && p.label.toLowerCase() === value.toLowerCase()
  )
  
  const [selectedPreset, setSelectedPreset] = useState(
    matchingPreset ? matchingPreset.id : (value ? 'custom' : '')
  )
  const [customValue, setCustomValue] = useState(
    matchingPreset ? '' : value
  )

  // Sync with external value changes (e.g., from templates)
  useEffect(() => {
    const preset = STYLE_PRESETS.find(
      p => p.id !== 'custom' && p.label.toLowerCase() === value.toLowerCase()
    )
    if (preset) {
      setSelectedPreset(preset.id)
      setCustomValue('')
    } else if (value && value !== customValue) {
      setSelectedPreset('custom')
      setCustomValue(value)
    }
  }, [value])

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId)
    
    if (presetId === 'custom') {
      // Keep or clear custom value
      onChange(customValue)
    } else {
      const preset = STYLE_PRESETS.find(p => p.id === presetId)
      if (preset) {
        onChange(preset.label)
      }
    }
  }

  const handleCustomChange = (newValue) => {
    setCustomValue(newValue)
    if (selectedPreset === 'custom') {
      onChange(newValue)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Style Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STYLE_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.id
          return (
            <motion.button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset.id)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex items-start gap-3 p-3 text-left border-2 rounded-lg transition-all duration-150',
                isSelected
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                  : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'
              )}
            >
              {/* Selection Indicator */}
              <div className={cn(
                'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                isSelected
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
              )}>
                {isSelected && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{preset.icon}</span>
                  <span className={cn(
                    'font-medium text-sm',
                    isSelected ? 'text-primary-900' : 'text-gray-900'
                  )}>
                    {preset.label}
                  </span>
                </div>
                <p className={cn(
                  'text-xs mt-0.5',
                  isSelected ? 'text-primary-700' : 'text-gray-500'
                )}>
                  {preset.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Custom Input Textarea */}
      <AnimatePresence>
        {selectedPreset === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              value={customValue}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Describe how your agent should communicate..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "Professional but approachable, using industry terminology when appropriate"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {hint && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
}
