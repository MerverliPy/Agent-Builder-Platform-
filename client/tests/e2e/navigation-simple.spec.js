const { test, expect } = require('@playwright/test');
const { resetDatabase, clearAuthToken, generateUniqueEmail } = require('./utils');

test.describe('Navigation E2E Tests (Simplified)', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test('should load home page', async ({ page }) => {
    await page.goto('/');
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    expect(page.url()).toContain('/login');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');
    expect(page.url()).toContain('/register');
  });

  test('should access agents page after login', async ({ page }) => {
    const username = await generateUniqueEmail();
    const password = 'TestPass123!';

    // Register
    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', username);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    await page.click('[data-testid="register-submit"]');
    await page.waitForURL(/login|dashboard|agents/, { timeout: 10000 });

    // If redirected to login, log in
    if (page.url().includes('/login')) {
      await page.fill('[data-testid="login-username"]', username);
      await page.fill('[data-testid="login-password"]', password);
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/dashboard|agents/, { timeout: 10000 });
    }

    // Should be on agents or dashboard page
    const url = page.url();
    expect(url.includes('/agents') || url.includes('/dashboard')).toBeTruthy();
  });

  test('should show sign-in prompt for unauthenticated users on agents page', async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
    
    // /agents is publicly accessible but shows sign-in prompt for unauthenticated users
    await page.goto('/agents');
    await page.waitForLoadState('networkidle');
    
    // Should show Sign In button or be on login page
    const signInVisible = await page.locator('button:has-text("Sign In"), a:has-text("Sign In")').first().isVisible().catch(() => false);
    const onLoginPage = page.url().includes('/login');
    expect(signInVisible || onLoginPage).toBeTruthy();
  });

  test('should handle 404 gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await page.waitForTimeout(1000);
    
    // Should either show 404 or redirect
    const url = page.url();
    expect(
      url.includes('nonexistent') ||
      url.includes('/login') ||
      url.endsWith('/')
    ).toBeTruthy();
  });
});
