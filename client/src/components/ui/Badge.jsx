import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Badge Component
 * 
 * A small label for displaying status, categories, or metadata.
 * 
 * @example
 * <Badge>Default</Badge>
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error" size="sm">Error</Badge>
 */

const variants = {
  default: 'bg-neutral-100 text-neutral-800',
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-success-100 text-success-800',
  warning: 'bg-warning-100 text-warning-800',
  error: 'bg-error-100 text-error-800',
  outline: 'border-2 border-neutral-300 text-neutral-700 bg-white',
}

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-colors'
  
  const classes = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  )

  return (
    <span className={classes} {...props}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      )}
      {children}
    </span>
  )
}

export default Badge
