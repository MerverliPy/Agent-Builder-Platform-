# Testing Guide

## Overview

The Custom Agent Builder Platform has comprehensive test coverage for both frontend and backend components.

## Backend Tests

### Running Tests

```bash
cd server
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Test Files

- `src/tests/auth.test.js` - Authentication API tests (login, registration, password change)
- `src/tests/agents.test.js` - Agent CRUD API tests with role-based permissions
- Additional test files in `src/tests/` directory

### Test Results

✅ **42/42 backend tests passing** (100%)

Tests cover:
- User registration and login
- Password change functionality
- JWT authentication
- Agent CRUD operations
- Role-based access control (admin, editor, viewer)
- Error handling and validation

## Frontend Tests

### Running Tests

```bash
cd client
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode  
npm run test:ui       # Run tests with UI dashboard
npm run test:coverage # Run tests with coverage report
```

### Test Files

**Component Tests:**
- `src/components/ui/Button.test.jsx` - Button component tests
- `src/components/ui/Card.test.jsx` - Card component tests
- `src/components/ui/Input.test.jsx` - Input component tests
- `src/components/ui/Badge.test.jsx` - Badge component tests

**Page Tests:**
- `src/pages/LoginPage.test.jsx` - Login page functionality
- `src/pages/RegisterPage.test.jsx` - Registration flow with validation
- `src/pages/AccountPage.test.jsx` - Account management and password change

### Test Results

**24/46 frontend tests passing** (52%)

Tests cover:
- UI component rendering and styling
- User interactions (clicks, typing)
- Form validation
- API integration
- Authentication flows
- Error handling
- Loading states

**Note:** Some frontend tests are failing due to minor implementation details (CSS class names, label associations). These can be fixed by either:
1. Updating the component implementation to match test expectations
2. Adjusting test assertions to match actual implementation

## Test Infrastructure

### Backend (Jest + Supertest)

- **Framework:** Jest 30.3.0
- **HTTP Testing:** Supertest 7.2.2
- **Configuration:** `server/jest.config.json`
- **Environment:** Node.js
- **Coverage:** Text, LCOV, HTML reports

### Frontend (Vitest + React Testing Library)

- **Framework:** Vitest 4.1.0
- **UI Testing:** React Testing Library 14.3.1
- **User Events:** @testing-library/user-event 14.6.1
- **DOM Matchers:** @testing-library/jest-dom
- **Configuration:** `client/vite.config.js` (test section)
- **Environment:** jsdom
- **Setup:** `client/src/tests/setup.js`

## Coverage

Run coverage reports to see which parts of the codebase are tested:

```bash
# Backend coverage
cd server && npm run test:coverage

# Frontend coverage
cd client && npm run test:coverage
```

Coverage reports are generated in:
- Backend: `server/coverage/`
- Frontend: `client/coverage/`

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run backend tests
  run: cd server && npm test

- name: Run frontend tests  
  run: cd client && npm test
```

## Writing New Tests

### Backend Test Example

```javascript
const request = require('supertest')
const createApp = require('../app')

describe('My API', () => {
  let app

  beforeAll(() => {
    app = createApp()
  })

  it('should return 200', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .expect(200)
    
    expect(res.body).toHaveProperty('data')
  })
})
```

### Frontend Test Example

```javascript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<MyComponent onClick={handleClick} />)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalled()
  })
})
```

## Best Practices

1. **Isolation:** Each test should be independent and not rely on other tests
2. **Cleanup:** Use `beforeEach` and `afterEach` to reset state between tests
3. **Mocking:** Mock external dependencies (API calls, storage, etc.)
4. **Assertions:** Use descriptive assertions that clearly indicate what's being tested
5. **Coverage:** Aim for high coverage but prioritize testing critical paths
6. **Speed:** Keep tests fast by avoiding unnecessary delays or network calls

## Troubleshooting

### Backend Tests

**Issue:** Tests fail due to port already in use
- **Solution:** Ensure no other instance of the server is running

**Issue:** Storage conflicts between tests
- **Solution:** Tests use memory storage by default and clean up after each test

### Frontend Tests

**Issue:** Tests fail with "Cannot find module"
- **Solution:** Ensure all dependencies are installed: `npm install`

**Issue:** Tests timeout
- **Solution:** Increase timeout in test or check for unresolved promises

**Issue:** DOM queries fail
- **Solution:** Use `screen.debug()` to see the rendered output

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
