/**
 * Test utilities and helpers for E2E tests
 */

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:5000/api'

/**
 * Reset the database by deleting all users and agents.
 * This should be called in beforeEach/beforeAll to ensure test isolation.
 * 
 * NOTE: Requires ENABLE_TEST_ROUTES=true on the server.
 */
export async function resetDatabase() {
  try {
    const response = await fetch(`${API_BASE}/test/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      console.warn('Database reset failed:', response.status, await response.text())
      return { success: false }
    }
    
    const result = await response.json()
    console.log('Database reset:', result)
    return result
  } catch (error) {
    console.warn('Database reset error:', error.message)
    return { success: false, error: error.message }
  }
}

export async function clearAuthToken(page) {
  try {
    await page.evaluate(() => {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        // localStorage might not be available
      }
    });
  } catch (e) {
    // Page context might not have localStorage access
  }
}

export async function setAuthToken(page, token, user) {
  try {
    await page.evaluate(({ token, user }) => {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        // localStorage might not be available
      }
    }, { token, user });
  } catch (e) {
    // Page context might not have localStorage access
  }
}

export async function getAuthToken(page) {
  try {
    return await page.evaluate(() => {
      try {
        return localStorage.getItem('token');
      } catch (e) {
        return null;
      }
    });
  } catch (e) {
    return null;
  }
}

export async function getCurrentUser(page) {
  try {
    return await page.evaluate(() => {
      try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
      } catch (e) {
        return null;
      }
    });
  } catch (e) {
    return null;
  }
}

export async function waitForApiResponse(page, urlPattern, timeout = 5000) {
  return page.waitForResponse(
    response => response.url().includes(urlPattern),
    { timeout }
  );
}

export async function fillForm(page, formData) {
  for (const [selector, value] of Object.entries(formData)) {
    await page.fill(selector, value);
  }
}

export async function generateUniqueEmail() {
  return `test-${Date.now()}@example.com`;
}

// Common selectors that prefer data-testid attributes but fall back to input types
export const usernameSelector = 'input[data-testid*="username"], input[data-testid*="agent-name"], input[type="email"]'
export const passwordSelector = 'input[data-testid*="password"], input[type="password"]'
export const confirmSelector = 'input[data-testid="register-confirm-password"], input[placeholder*="Confirm"]'

// Helper to fill auth/register forms consistently
export async function fillAuthFields(page, username, password, confirm = null) {
  // Wait for fields to appear and fill them; be resilient if data-testid isn't present
  try {
    await page.waitForSelector(usernameSelector, { timeout: 5000 })
    await page.fill(usernameSelector, username)
  } catch (e) {
    // fallback: find first editable input (not readonly/disabled)
    const editable = page.locator('input:not([readonly]):not([disabled])')
    const cnt = await editable.count()
    if (cnt > 0) await editable.nth(0).fill(username)
  }

  try {
    await page.waitForSelector(passwordSelector, { timeout: 5000 })
    await page.fill(passwordSelector, password)
  } catch (e) {
    const editable = page.locator('input:not([readonly]):not([disabled])')
    const cnt = await editable.count()
    if (cnt > 1) await editable.nth(1).fill(password)
  }

  if (confirm !== null) {
    try {
      await page.waitForSelector(confirmSelector, { timeout: 5000 })
      await page.fill(confirmSelector, confirm)
    } catch (e) {
      const editable = page.locator('input:not([readonly]):not([disabled])')
      const cnt = await editable.count()
      if (cnt > 2) await editable.nth(2).fill(confirm)
    }
  }
}
