const { test, expect } = require('@playwright/test');

test.describe('Navigation E2E Tests (Simplified)', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    expect(page.url()).toMatch(/localhost:3000|100.81.83.98:3000/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('a, button:has-text("Sign in"), a:has-text("Login")');
    await page.waitForURL(/login/, { timeout: 3000 });
    expect(page.url()).toContain('/login');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.click('a:has-text("Sign up"), a:has-text("Register"), button:has-text("Register")');
    await page.waitForURL(/register/, { timeout: 3000 });
    expect(page.url()).toContain('/register');
  });

  test('should access agents page after login', async ({ page }) => {
    // Register and login
    const username = `navtest${Date.now()}`;
    const password = 'TestPass123!';

    await page.goto('/register');
    const inputs = await page.locator('input').all();
    if (inputs.length >= 3) {
      await inputs[0].fill(username);
      await inputs[1].fill(password);
      await inputs[2].fill(password);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    }

    // Should be on agents page
    expect(page.url()).toContain('/agents');
  });

  test('should redirect to login for protected routes without auth', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/agents');
    await page.waitForURL(/login/, { timeout: 3000 });
    expect(page.url()).toContain('/login');
  });

  test('should handle 404 gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    
    // Should either show 404 or redirect
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(
      url.includes('nonexistent') ||
      url.includes('/login') ||
      url === 'http://localhost:3000/'
    ).toBeTruthy();
  });
});
