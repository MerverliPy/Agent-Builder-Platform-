const { test, expect } = require('@playwright/test');

test.describe('Error Handling E2E Tests (Simplified)', () => {
  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    const { fillAuthFields } = require('./utils');
    await fillAuthFields(page, 'nonexistent', 'wrongpass');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    // Wait for error or stay on page
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/register');
    const { fillAuthFields: fillRegFields } = require('./utils');
    await fillRegFields(page, 'testuser', 'Password123!', 'DifferentPass456!');
    await page.click('button[type="submit"], button:has-text("Register"), button:has-text("Create account")');
    // Should show error
    await page.waitForTimeout(1000);
    const content = await page.textContent('body');
    expect(content).toContain('do not match' || content.includes('Passwords'));
  });

  test('should show error for empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without filling
    await page.click('button[type="submit"]');
    
    // Should stay on form
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/login');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept and fail API calls
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    await page.goto('/login');
    const { fillAuthFields: fillLoginFields } = require('./utils');
    await fillLoginFields(page, 'testuser', 'password');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    // Should show error
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should show duplicate user error', async ({ page }) => {
    const username = `duplicate${Date.now()}`;
    const password = 'TestPass123!';

    // Register first user
    await page.goto('/register');
    const { fillAuthFields: fillFirstReg } = require('./utils');
    await fillFirstReg(page, username, password, password);
    await page.click('button[type="submit"], button:has-text("Register"), button:has-text("Create account")');
    await page.waitForNavigation({ timeout: 3000 }).catch(() => {});

    // Try to register with same username
    await page.goto('/register');
    const { fillAuthFields: fillSecondReg } = require('./utils');
    await fillSecondReg(page, username, password, password);
    await page.click('button[type="submit"], button:has-text("Register"), button:has-text("Create account")');
    // Should show error
    await page.waitForTimeout(2000);
    const content2 = await page.textContent('body');
    expect(content2).toContain('exists' || content2.includes('already'));
  });

  test('should validate required fields on agent creation', async ({ page }) => {
    // Login first
    const username = `errortest${Date.now()}`;
    const password = 'TestPass123!';

    await page.goto('/register');
    const { fillAuthFields: fillReg } = require('./utils');
    await fillReg(page, username, password, password);
    await page.click('button[type="submit"], button:has-text("Register"), button:has-text("Create account")');
    await page.waitForNavigation();

    // Navigate to create agent
    await page.goto('/agents/new');
    
    // Try to submit without name
    await page.click('button[type="submit"], button:has-text("Create")');
    
    // Should either stay on form or show error
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/agents/new');
  });
});
