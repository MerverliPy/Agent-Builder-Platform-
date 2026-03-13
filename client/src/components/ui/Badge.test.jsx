import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders badge with text', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText(/new/i)).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    const { rerender, container } = render(<Badge variant="primary">Primary</Badge>)
    expect(container.firstChild).toHaveClass('bg-primary-100', 'text-primary-800')

    rerender(<Badge variant="success">Success</Badge>)
    expect(container.firstChild).toHaveClass('bg-success-100', 'text-success-800')

    rerender(<Badge variant="warning">Warning</Badge>)
    expect(container.firstChild).toHaveClass('bg-warning-100', 'text-warning-800')

    rerender(<Badge variant="error">Error</Badge>)
    expect(container.firstChild).toHaveClass('bg-error-100', 'text-error-800')
  })

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Badge</Badge>)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders with default styles', () => {
    const { container } = render(<Badge>Badge</Badge>)
    expect(container.firstChild).toHaveClass('inline-flex', 'items-center', 'justify-center', 'font-medium', 'rounded-full', 'transition-colors')
  })
})
