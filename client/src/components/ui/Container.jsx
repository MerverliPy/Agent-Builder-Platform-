import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Container Component
 * 
 * A responsive container that centers content with max-width constraints.
 * 
 * @example
 * <Container>Content</Container>
 * <Container size="sm">Narrow content</Container>
 * <Container padding={false}>No padding</Container>
 */

const sizes = {
  sm: 'max-w-3xl',   // ~768px
  md: 'max-w-5xl',   // ~1024px
  lg: 'max-w-7xl',   // ~1280px
  xl: 'max-w-screen-2xl', // ~1536px
  full: 'max-w-full',
}

export const Container = ({
  children,
  size = 'lg',
  padding = true,
  className,
  ...props
}) => {
  const baseClasses = 'w-full mx-auto'
  const paddingClasses = padding && 'px-4 sm:px-6 lg:px-8'
  
  const classes = cn(
    baseClasses,
    sizes[size],
    paddingClasses,
    className
  )

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

/**
 * Section Component
 * 
 * A section wrapper with consistent vertical spacing.
 */
export const Section = ({
  children,
  spacing = 'md',
  className,
  ...props
}) => {
  const spacingClasses = {
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16 lg:py-20',
    lg: 'py-16 md:py-20 lg:py-24',
    xl: 'py-20 md:py-24 lg:py-32',
  }

  const classes = cn(
    spacingClasses[spacing],
    className
  )

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  )
}

/**
 * Grid Component
 * 
 * A responsive grid layout component.
 */
export const Grid = ({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 6,
  className,
  ...props
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  }

  const baseClasses = 'grid'
  const gapClass = `gap-${gap}`
  
  // Build responsive grid classes
  const colClasses = [
    cols.default && gridCols[cols.default],
    cols.sm && `sm:${gridCols[cols.sm]}`,
    cols.md && `md:${gridCols[cols.md]}`,
    cols.lg && `lg:${gridCols[cols.lg]}`,
    cols.xl && `xl:${gridCols[cols.xl]}`,
  ].filter(Boolean).join(' ')

  const classes = cn(
    baseClasses,
    gapClass,
    colClasses,
    className
  )

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

/**
 * Stack Component
 * 
 * A flex column layout with consistent spacing.
 */
export const Stack = ({
  children,
  spacing = 4,
  align = 'stretch',
  className,
  ...props
}) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  const gapClass = `gap-${spacing}`
  
  const classes = cn(
    'flex flex-col',
    gapClass,
    alignClasses[align],
    className
  )

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default Container
