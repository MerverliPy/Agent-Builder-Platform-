import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Spinner Component
 * 
 * A loading spinner with multiple sizes and variants.
 * 
 * @example
 * <Spinner />
 * <Spinner size="lg" variant="primary" />
 */

const sizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
  xl: 'w-12 h-12 border-[3px]',
}

const variants = {
  default: 'border-neutral-300 border-t-neutral-600',
  primary: 'border-primary-200 border-t-primary-600',
  white: 'border-white/30 border-t-white',
}

export const Spinner = ({
  size = 'md',
  variant = 'default',
  className,
  ...props
}) => {
  const classes = cn(
    'inline-block rounded-full animate-spin',
    sizes[size],
    variants[variant],
    className
  )

  return (
    <div
      role="status"
      aria-label="Loading"
      className={classes}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * LoadingOverlay Component
 * 
 * A full-screen loading overlay.
 */
export const LoadingOverlay = ({
  show,
  text = 'Loading...',
  className,
  ...props
}) => {
  if (!show) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-4 bg-white rounded-lg p-8 shadow-xl">
        <Spinner size="lg" variant="primary" />
        {text && <p className="text-neutral-700 font-medium">{text}</p>}
      </div>
    </div>
  )
}

/**
 * Skeleton Component
 * 
 * A placeholder skeleton for loading states.
 */
export const Skeleton = ({
  width = '100%',
  height = '1rem',
  circle = false,
  className,
  ...props
}) => {
  const classes = cn(
    'animate-pulse bg-neutral-200',
    circle ? 'rounded-full' : 'rounded',
    className
  )

  return (
    <div
      className={classes}
      style={{ width, height }}
      aria-label="Loading"
      {...props}
    />
  )
}

/**
 * SkeletonText Component
 * 
 * Multiple skeleton lines for text loading.
 */
export const SkeletonText = ({
  lines = 3,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonCard Component
 * 
 * A skeleton placeholder for card components.
 */
export const SkeletonCard = ({ className, ...props }) => {
  return (
    <div
      className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}
      {...props}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton circle width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="1rem" />
          <Skeleton width="40%" height="0.875rem" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

export default Spinner
