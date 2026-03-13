import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders card with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )
    expect(screen.getByText(/card content/i)).toBeInTheDocument()
  })

  it('applies hover effect when hover prop is true', () => {
    const { container } = render(<Card hover>Hoverable card</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('hover:shadow-lg')
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('custom-class')
  })

  it('renders with default styles', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border', 'border-neutral-200', 'p-6')
  })
})
