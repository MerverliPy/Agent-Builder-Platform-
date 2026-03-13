import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Avatar Component
 * 
 * Displays a user avatar image with fallback to initials.
 * 
 * @example
 * <Avatar src="/image.jpg" alt="John Doe" />
 * <Avatar name="John Doe" />
 * <Avatar size="lg" />
 */

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
}

export const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  className,
  fallbackClassName,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false)
  
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const baseClasses = 'rounded-full overflow-hidden flex items-center justify-center bg-primary-100 text-primary-700 font-semibold select-none'
  
  const classes = cn(
    baseClasses,
    sizes[size],
    className
  )

  if (src && !imageError) {
    return (
      <div className={classes} {...props}>
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  return (
    <div className={cn(classes, fallbackClassName)} {...props}>
      {getInitials(name || alt || '')}
    </div>
  )
}

/**
 * AvatarGroup Component
 * 
 * Displays a group of overlapping avatars.
 */
export const AvatarGroup = ({
  children,
  max = 5,
  size = 'md',
  className,
  ...props
}) => {
  const childArray = React.Children.toArray(children)
  const displayedChildren = childArray.slice(0, max)
  const remaining = childArray.length - max

  return (
    <div className={cn('flex -space-x-2', className)} {...props}>
      {displayedChildren.map((child, index) => (
        <div key={index} className="relative ring-2 ring-white rounded-full">
          {React.cloneElement(child, { size })}
        </div>
      ))}
      
      {remaining > 0 && (
        <Avatar
          name={`+${remaining}`}
          size={size}
          className="ring-2 ring-white"
        />
      )}
    </div>
  )
}

export default Avatar
