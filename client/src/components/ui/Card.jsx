import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * Card Component
 * 
 * A flexible card container with hover effects and variants.
 * 
 * @example
 * <Card>Content</Card>
 * <Card variant="bordered" hover>Bordered card with hover</Card>
 * <Card interactive onClick={handler}>Clickable card</Card>
 */

const variants = {
  default: 'bg-white shadow-sm border border-neutral-200',
  bordered: 'bg-white border-2 border border-neutral-200',
  elevated: 'bg-white shadow-md border border-neutral-100',
  ghost: 'bg-transparent',
}

/**
 * CardHeader Component
 */
export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
)

/**
 * CardTitle Component
 */
export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-xl font-semibold text-neutral-900', className)} {...props}>
    {children}
  </h3>
)

/**
 * CardDescription Component
 */
export const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm text-neutral-600 mt-1', className)} {...props}>
    {children}
  </p>
)

/**
 * CardContent Component
 */
export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
)

/**
 * CardFooter Component
 */
export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('mt-4 flex items-center gap-2', className)} {...props}>
    {children}
  </div>
)

export const Card = React.forwardRef(({
  children,
  variant = 'default',
  hover = false,
  interactive = false,
  padding = 'md',
  className,
  onClick,
  ...props
}, ref) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const baseClasses = 'rounded-lg transition-all duration-200'
  
  const hoverClasses = (hover || interactive) && 'hover:-translate-y-1 hover:shadow-lg'
  const interactiveClasses = interactive && 'cursor-pointer active:scale-[0.99]'
  
  const classes = cn(
    baseClasses,
    variants[variant],
    paddingClasses[padding],
    hoverClasses,
    interactiveClasses,
    className
  )

  const Component = interactive || onClick ? motion.div : 'div'

  const motionProps = (interactive || onClick) ? {
    whileHover: { y: -4 },
    whileTap: { scale: 0.99 },
  } : {}

  return (
    <Component
      ref={ref}
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
})

Card.displayName = 'Card'

// Attach subcomponents to Card for dot notation
Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
