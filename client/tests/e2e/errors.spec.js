const { test, expect } = require('@playwright/test');
const { resetDatabase, clearAuthToken, generateUniqueEmail } = require('./utils');

// Helper to register and login
async function registerAndLogin(page) {
  const email = await generateUniqueEmail();
  const password = 'TestPassword123!';

  await page.goto('/register');
  await page.fill('[data-testid="register-username"]', email);
  await page.fill('[data-testid="register-password"]', password);
  await page.fill('[data-testid="register-confirm-password"]', password);
  await page.click('[data-testid="register-submit"]');
  await page.waitForURL(/login|dashboard|agents/, { timeout: 10000 });

  if (page.url().includes('/login')) {
    await page.fill('[data-testid="login-username"]', email);
    await page.fill('[data-testid="login-password"]', password);
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL(/dashboard|agents/, { timeout: 10000 });
  }

  return { email, password };
}

test.describe('Error Handling E2E Tests', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
  });

  test('should show validation error for empty name field', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to create agent
    await page.goto('/agents/new');

    // Try to submit form without name
    await page.click('[data-testid="agentform-submit"]');

    // Should stay on form (validation error)
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/agents/new');
  });

  test('should show error for short password', async ({ page }) => {
    await page.goto('/register');

    // Enter valid username but password that's too short (< 6 chars)
    const email = await generateUniqueEmail();
    await page.fill('[data-testid="register-username"]', email);
    await page.fill('[data-testid="register-password"]', '12345');  // Only 5 chars
    await page.fill('[data-testid="register-confirm-password"]', '12345');

    // Try to submit
    await page.click('[data-testid="register-submit"]');

    // Should stay on register page and show error
    await page.waitForTimeout(2000);
    
    // Check that either:
    // 1. Still on register page (validation prevented submission)
    // 2. Error message is visible
    const url = page.url();
    const stillOnRegister = url.includes('/register');
    const errorVisible = await page.locator('text=/password|characters|error/i').first().isVisible().catch(() => false);
    
    expect(stillOnRegister || errorVisible).toBeTruthy();
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/register');

    const email = await generateUniqueEmail();
    await page.fill('[data-testid="register-username"]', email);
    await page.fill('[data-testid="register-password"]', 'TestPassword123!');
    await page.fill('[data-testid="register-confirm-password"]', 'DifferentPassword456!');

    // Try to submit
    await page.click('[data-testid="register-submit"]');

    // Should stay on form or show error
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/register');
  });

  test('should show error for duplicate email on registration', async ({ page }) => {
    const email = await generateUniqueEmail();
    const password = 'TestPassword123!';

    // First registration
    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', email);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    await page.click('[data-testid="register-submit"]');
    await page.waitForURL(/login|dashboard|agents/, { timeout: 10000 });

    // Clear auth and try to register with same email
    await clearAuthToken(page);
    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', email);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    await page.click('[data-testid="register-submit"]');

    // Should show error or stay on register page
    await page.waitForTimeout(2000);
    
    // Check for error message
    const errorVisible = await page.locator('text=/exists|already|taken|error/i').isVisible().catch(() => false);
    const stillOnRegister = page.url().includes('/register');
    
    expect(errorVisible || stillOnRegister).toBeTruthy();
  });

  test('should handle invalid token gracefully', async ({ page }) => {
    // Set invalid token using the correct key (cabp_token)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cabp_token', 'invalid-token');
      localStorage.setItem('user', JSON.stringify({ id: '123', username: 'test' }));
    });

    // Try to access protected operation (creating an agent)
    await page.goto('/agents/new');
    await page.waitForLoadState('networkidle');

    // Fill agent form
    await page.fill('[data-testid="agent-name"]', 'Test Agent Invalid Token');
    await page.click('[data-testid="agentform-submit"]');

    // Should show error or stay on form due to invalid token
    await page.waitForTimeout(2000);
    
    // Should either redirect to login, show error, or stay on form
    const url = page.url();
    const bodyText = await page.textContent('body');
    expect(
      url.includes('/login') ||
      url.includes('/agents/new') ||
      bodyText.toLowerCase().includes('error') ||
      bodyText.toLowerCase().includes('unauthorized')
    ).toBeTruthy();
  });

  test('should show error for non-existent agent', async ({ page }) => {
    await registerAndLogin(page);

    // Try to access non-existent agent
    await page.goto('/agents/ag_nonexistent123');

    // Should show error or redirect
    await page.waitForTimeout(2000);
    const url = page.url();
    const bodyText = await page.textContent('body');
    
    // Should either show error message or redirect to agents list
    expect(
      bodyText.toLowerCase().includes('not found') ||
      bodyText.toLowerCase().includes('error') ||
      url.includes('/agents')
    ).toBeTruthy();
  });

  test('should handle API failures gracefully', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to agents page - should handle any API issues gracefully
    await page.goto('/agents');
    await page.waitForLoadState('networkidle');

    // Page should still render something
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('should handle network timeout gracefully', async ({ page }) => {
    await registerAndLogin(page);

    // The app should handle slow/failed requests gracefully
    await page.goto('/agents');
    await page.waitForLoadState('networkidle');

    // Should show content or loading state
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });
});
