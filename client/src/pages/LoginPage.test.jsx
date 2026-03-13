import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { AuthProvider } from '../context/AuthContext'

// Mock the API
global.fetch = vi.fn()

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form', async () => {
    renderLoginPage()
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(await screen.findByPlaceholderText(/enter your username/i)).toBeInTheDocument()
    expect(await screen.findByPlaceholderText(/enter your password/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders link to registration page', () => {
    renderLoginPage()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register')
  })

  it('shows validation error for empty fields', async () => {
    const user = userEvent.setup()
    renderLoginPage()
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    // HTML5 validation should prevent submission
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'test-token',
        user: { id: 1, username: 'testuser', roles: ['viewer'] }
      })
    })

    renderLoginPage()
    
    await user.type(screen.getByPlaceholderText(/enter your username/i), 'testuser')
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'testuser', password: 'password123' })
        })
      )
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' })
    })

    renderLoginPage()
    
    await user.type(screen.getByPlaceholderText(/enter your username/i), 'testuser')
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during login', async () => {
    const user = userEvent.setup()
    global.fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderLoginPage()
    
    await user.type(screen.getByPlaceholderText(/enter your username/i), 'testuser')
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
  })
})
