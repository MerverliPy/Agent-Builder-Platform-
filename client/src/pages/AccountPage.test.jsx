import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AccountPage from './AccountPage'
import { AuthProvider } from '../context/AuthContext'

// Mock the API
global.fetch = vi.fn()

const mockUser = {
  id: 1,
  username: 'testuser',
  roles: ['viewer', 'editor']
}

const mockToken = 'test-token'

// Mock AuthContext
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      token: mockToken,
      logout: vi.fn()
    })
  }
})

const renderAccountPage = () => {
  return render(
    <BrowserRouter>
      <AccountPage />
    </BrowserRouter>
  )
}

describe('AccountPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user information', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })

    renderAccountPage()

    expect(await screen.findByRole('heading', { name: /account settings/i })).toBeInTheDocument()
    expect(await screen.findByText('testuser')).toBeInTheDocument()
    expect(await screen.findByText('viewer')).toBeInTheDocument()
    expect(await screen.findByText('editor')).toBeInTheDocument()
  })

  it('fetches user data from server on mount', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })

    renderAccountPage()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` }
        })
      )
    })
  })

  it('renders password change form', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })

    renderAccountPage()

    expect(await screen.findByRole('heading', { name: /change password/i })).toBeInTheDocument()
    expect(await screen.findByPlaceholderText(/enter your current password/i)).toBeInTheDocument()
    expect(await screen.findByPlaceholderText(/enter your new password/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /change password/i })).toBeInTheDocument()
  })

  it('handles successful password change', async () => {
    const user = userEvent.setup()
    
    // Mock initial user fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })

    // Mock password change
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password changed' })
    })

    renderAccountPage()
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument() // User ID appears when loaded
    })

    await user.type(screen.getByPlaceholderText(/enter your current password/i), 'oldpassword')
    await user.type(screen.getByPlaceholderText(/enter your new password/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      // Check the second fetch call (first is for /auth/me)
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenNthCalledWith(2,
        expect.stringContaining('/auth/change-password'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          },
          body: JSON.stringify({
            currentPassword: 'oldpassword',
            newPassword: 'newpassword123'
          })
        })
      )
    })

    await waitFor(() => {
      expect(screen.getByText(/password changed successfully/i)).toBeInTheDocument()
    })
  })

  it('displays error message on password change failure', async () => {
    const user = userEvent.setup()
    
    // Mock initial user fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })

    // Mock failed password change
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Current password is incorrect' })
    })

    renderAccountPage()
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText(/enter your current password/i), 'wrongpassword')
    await user.type(screen.getByPlaceholderText(/enter your new password/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(screen.getByText(/current password is incorrect/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('clears form after successful password change', async () => {
    const user = userEvent.setup()
    
    // Mock initial user fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })

    // Mock password change
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password changed' })
    })

    renderAccountPage()
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    const currentPasswordInput = screen.getByPlaceholderText(/enter your current password/i)
    const newPasswordInput = screen.getByPlaceholderText(/enter your new password/i)
    
    await user.type(currentPasswordInput, 'oldpassword')
    await user.type(newPasswordInput, 'newpassword123')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(currentPasswordInput).toHaveValue('')
      expect(newPasswordInput).toHaveValue('')
    }, { timeout: 3000 })
  })

  it('renders sign out section', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })

    renderAccountPage()
    
    expect(screen.getByRole('heading', { name: /sign out/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })
})
