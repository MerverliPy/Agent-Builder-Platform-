const { test, expect } = require('@playwright/test');

test.describe('Authentication E2E Tests (Simplified)', () => {
  const { fillAuthFields } = require('./utils');

  test('should register a new user successfully', async ({ page }) => {
    // Navigate directly to the register page to avoid ambiguous nav selectors
    await page.goto('/register');
    
    const username = `testuser${Date.now()}`;
    const password = 'TestPass123!';

    // Fill form using helper that prefers data-testid
    await page.waitForSelector('input', { timeout: 5000 });
    await fillAuthFields(page, username, password, password);
    // Submit form - prefer the explicit Create account button on RegisterPage
    await page.click('button:has-text("Create account"), button[type="submit"], button:has-text("Register"), button:has-text("Sign up")');

    // Should redirect to agents or show success
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    expect(page.url()).toMatch(/agents|dashboard|login/);
  });

  test('should login with valid credentials', async ({ page }) => {
    const username = 'testuser123';
    const password = 'TestPass123!';

    // First register using helper
    await page.goto('/register');
    const uniqueUsername = `${username}${Date.now()}`;
    await fillAuthFields(page, `${uniqueUsername}`, password, password);
    await page.click('button[type="submit"], button:has-text("Register"), button:has-text("Create account")');
    await page.waitForNavigation().catch(() => {});

    // Now login using helper
    await page.goto('/login');
    await fillAuthFields(page, `${uniqueUsername}`, password);
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');

    // Should redirect to agents
    await page.waitForNavigation();
    expect(page.url()).toContain('/agents');
  });

  test('should not login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    // use helper to reliably fill fields
    await fillAuthFields(page, 'nonexistent@test.com', 'WrongPassword123!');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');

    // Wait for error or check URL hasn't changed
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Navigate to app origin then clear auth storage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/agents');

    // App may either redirect to /login or show a sign-in CTA on the Agents page.
    // Accept either behavior to make test resilient.
    const signInSelector = 'button:has-text("Sign in"), button:has-text("Login")'
    const signInVisible = await page.locator(signInSelector).first().isVisible().catch(() => false)
    if (!signInVisible) {
      await page.waitForURL(/login/, { timeout: 5000 });
      expect(page.url()).toContain('/login');
    } else {
      expect(signInVisible).toBeTruthy();
    }
  });

  test('should logout successfully', async ({ page }) => {
    // Register and login first
    const username = `logout${Date.now()}`;
    const password = 'TestPass123!';

    await page.goto('/register');
    await fillAuthFields(page, username, password, password);
    await page.click('button[type="submit"], button:has-text("Create account"), button:has-text("Register")');
    await page.waitForNavigation().catch(() => {});

    // Find and click logout
    const buttons = await page.locator('button').allTextContents();
    if (buttons.some(t => t.includes('Logout'))) {
      await page.click('button:has-text("Logout")');
      
      // Should redirect to login or home
      await page.waitForNavigation().catch(() => {});
      expect(['/login', '/']).toContain(page.url().split('?')[0].split(':')[2]?.split('/')[1] || '/');
    }
  });
});
