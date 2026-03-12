import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDialog from '../ConfirmDialog'

test('renders when open and calls callbacks', () => {
  const onCancel = jest.fn()
  const onConfirm = jest.fn()
  render(<ConfirmDialog open={true} title="T" message="M" onCancel={onCancel} onConfirm={onConfirm} />)
  expect(screen.getByText('T')).toBeInTheDocument()
  expect(screen.getByText('M')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Cancel'))
  expect(onCancel).toHaveBeenCalled()
})
