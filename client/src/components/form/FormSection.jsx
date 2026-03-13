import React from 'react'

/**
 * FormSection Component
 * 
 * Groups related form fields with a consistent header and spacing.
 * Used to organize the agent creation form into logical sections.
 * 
 * @example
 * <FormSection title="Identity" description="Define your agent's name and appearance">
 *   <Input label="Name" />
 * </FormSection>
 */

export default function FormSection({
  title,
  description,
  children,
  className = '',
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section Header */}
      {title && (
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Section Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}
