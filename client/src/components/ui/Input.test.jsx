import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders input with label', () => {
    render(<Input label="Username" />)
    expect(screen.getByText(/username/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders input without label', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument()
  })

  it('displays hint text', () => {
    render(<Input label="Email" hint="Enter your email address" />)
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input label="Password" error="Password is required" />)
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('applies error styles when error prop is present', () => {
    render(<Input label="Field" error="Error message" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-error-500', 'focus:border-error-500', 'focus:ring-error-500')
  })

  it('handles user input', async () => {
    const user = userEvent.setup()
    render(<Input label="Name" />)
    const input = screen.getByRole('textbox')
    
    await user.type(input, 'John Doe')
    expect(input).toHaveValue('John Doe')
  })

  it('can be disabled', () => {
    render(<Input label="Disabled" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('can be required', () => {
    render(<Input label="Required" required />)
    expect(screen.getByRole('textbox')).toBeRequired()
  })

  it('supports different types', () => {
    const { container, rerender } = render(<Input label="Text" type="text" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')

    rerender(<Input label="Email" type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input label="Password" type="password" />)
    const passwordInput = container.querySelector('input[type="password"]')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('applies fullWidth class', () => {
    const { container } = render(<Input label="Full Width" fullWidth />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('w-full')
  })
})
