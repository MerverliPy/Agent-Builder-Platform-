import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AgentForm from '../AgentForm'

test('validates name and calls onSubmit', async () => {
  const onSubmit = jest.fn().mockResolvedValue()
  render(<AgentForm onSubmit={onSubmit} />)
  fireEvent.click(screen.getByText('Save'))
  expect(await screen.findByText('Name is required')).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'A' } })
  fireEvent.click(screen.getByText('Save'))
  // onSubmit should be called; wait for the async submit flow to complete
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
})
