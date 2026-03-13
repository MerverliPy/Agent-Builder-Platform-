import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Input Component
 * 
 * A flexible form input with error states and icons.
 * 
 * @example
 * <Input placeholder="Enter text" />
 * <Input type="email" error="Invalid email" />
 * <Input icon={<SearchIcon />} />
 */

export const Input = React.forwardRef(({
  type = 'text',
  error,
  label,
  hint,
  icon,
  iconPosition = 'left',
  className,
  containerClassName,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-500'
  
  const stateClasses = error
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
    : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
  
  const iconClasses = icon && (
    iconPosition === 'left' ? 'pl-10' : 'pr-10'
  )
  
  const classes = cn(
    baseClasses,
    stateClasses,
    iconClasses,
    className
  )

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={classes}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error-600" id={`${props.id}-error`} role="alert">
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-sm text-neutral-500" id={`${props.id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

/**
 * Textarea Component
 */
export const Textarea = React.forwardRef(({
  error,
  label,
  hint,
  rows = 4,
  className,
  containerClassName,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-500 resize-y'
  
  const stateClasses = error
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
    : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
  
  const classes = cn(
    baseClasses,
    stateClasses,
    className
  )

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={classes}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-error-600" id={`${props.id}-error`} role="alert">
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-sm text-neutral-500" id={`${props.id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Input
