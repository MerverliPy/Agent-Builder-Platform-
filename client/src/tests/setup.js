import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock framer-motion globally to avoid animation prop warnings and async updates
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      // Filter out animation-related props that would cause React warnings
      const { variants, initial, animate, exit, transition, whileTap, whileHover, ...safeProps } = props
      return {
        $$typeof: Symbol.for('react.element'),
        type: 'div',
        props: { ...safeProps, children },
        key: null,
        ref: null,
      }
    },
    button: ({ children, ...props }) => {
      // Filter out animation-related props for button elements
      const { variants, initial, animate, exit, transition, whileTap, whileHover, ...safeProps } = props
      return {
        $$typeof: Symbol.for('react.element'),
        type: 'button',
        props: { ...safeProps, children },
        key: null,
        ref: null,
      }
    },
  },
  AnimatePresence: ({ children }) => children,
}))

// Stub window.requestAnimationFrame to be synchronous to prevent async updates
let rafId = 0
global.requestAnimationFrame = vi.fn((callback) => {
  const id = ++rafId
  setTimeout(callback, 0)
  return id
})

global.cancelAnimationFrame = vi.fn((id) => {
  // no-op
})

// Mock window.location to prevent navigation side-effects
delete window.location
window.location = {
  href: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
}
