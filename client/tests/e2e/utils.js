/**
 * Test utilities and helpers for E2E tests
 */

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
