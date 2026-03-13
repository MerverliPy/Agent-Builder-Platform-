import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
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

const renderRegisterPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders registration form', async () => {
    renderRegisterPage()
    expect(await screen.findByRole('heading', { name: /create an account/i })).toBeInTheDocument()
    expect(await screen.findByPlaceholderText(/choose a username/i)).toBeInTheDocument()
    expect(await screen.findByPlaceholderText(/create a password/i)).toBeInTheDocument()
    expect(await screen.findByPlaceholderText(/confirm your password/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders link to login page', () => {
    renderRegisterPage()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login')
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderRegisterPage()
    
    await user.type(screen.getByPlaceholderText(/choose a username/i), 'newuser')
    await user.type(screen.getByPlaceholderText(/create a password/i), 'password123')
    await user.type(screen.getByPlaceholderText(/confirm your password/i), 'differentpassword')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    const user = userEvent.setup()
    renderRegisterPage()
    
    await user.type(screen.getByPlaceholderText(/choose a username/i), 'newuser')
    await user.type(screen.getByPlaceholderText(/create a password/i), '12345')
    await user.type(screen.getByPlaceholderText(/confirm your password/i), '12345')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('handles successful registration and auto-login', async () => {
    const user = userEvent.setup()
    
    // Mock successful registration
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User registered' })
    })
    
    // Mock successful login
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'test-token',
        user: { id: 1, username: 'newuser', roles: ['viewer'] }
      })
    })

    renderRegisterPage()
    
    await user.type(screen.getByPlaceholderText(/choose a username/i), 'newuser')
    await user.type(screen.getByPlaceholderText(/create a password/i), 'password123')
    await user.type(screen.getByPlaceholderText(/confirm your password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'newuser', password: 'password123', roles: ['viewer'] })
        })
      )
    })

    // Should auto-login after registration
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.any(Object)
      )
    })
  })

  it('displays error message on registration failure', async () => {
    const user = userEvent.setup()
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Username already exists' })
    })

    renderRegisterPage()
    
    await user.type(screen.getByPlaceholderText(/choose a username/i), 'existinguser')
    await user.type(screen.getByPlaceholderText(/create a password/i), 'password123')
    await user.type(screen.getByPlaceholderText(/confirm your password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during registration', async () => {
    const user = userEvent.setup()
    global.fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderRegisterPage()
    
    await user.type(screen.getByPlaceholderText(/choose a username/i), 'newuser')
    await user.type(screen.getByPlaceholderText(/create a password/i), 'password123')
    await user.type(screen.getByPlaceholderText(/confirm your password/i), 'password123')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
  })
})
