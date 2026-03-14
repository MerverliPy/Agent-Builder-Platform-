const { test, expect } = require('@playwright/test');
const { fillAuthFields, resetDatabase, clearAuthToken, getAuthToken, generateUniqueEmail } = require('./utils');

test.describe('Authentication E2E Tests (Simplified)', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
  });

  test('should register a new user successfully', async ({ page }) => {
    // Navigate directly to the register page
    await page.goto('/register');
    
    const username = await generateUniqueEmail();
    const password = 'TestPass123!';

    // Fill form using data-testid selectors
    await page.fill('[data-testid="register-username"]', username);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    
    // Submit form
    await page.click('[data-testid="register-submit"]');

    // Should redirect to agents, dashboard, or login
    await page.waitForURL(/agents|dashboard|login/, { timeout: 10000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    const username = await generateUniqueEmail();
    const password = 'TestPass123!';

    // First register
    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', username);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    await page.click('[data-testid="register-submit"]');
    await page.waitForURL(/agents|dashboard|login/, { timeout: 10000 });

    // Clear auth and go to login
    await clearAuthToken(page);
    await page.goto('/login');
    
    // Login using data-testid
    await page.fill('[data-testid="login-username"]', username);
    await page.fill('[data-testid="login-password"]', password);
    await page.click('[data-testid="login-submit"]');

    // Should redirect to agents or dashboard
    await page.waitForURL(/agents|dashboard/, { timeout: 10000 });
  });

  test('should not login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Try login with wrong credentials
    await page.fill('[data-testid="login-username"]', 'nonexistent@test.com');
    await page.fill('[data-testid="login-password"]', 'WrongPassword123!');
    await page.click('[data-testid="login-submit"]');

    // Wait a moment for error handling
    await page.waitForTimeout(2000);
    
    // Should still be on login page
    expect(page.url()).toContain('/login');
  });

  test('should show sign-in prompt when accessing agents without auth', async ({ page }) => {
    // Clear auth and try to access agents page
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/agents');
    await page.waitForLoadState('networkidle');

    // Agents page is publicly viewable but shows sign-in prompts
    expect(page.url()).toContain('/agents');
    
    // Should show sign-in prompt instead of create button
    const signInPrompt = page.locator('button:has-text("Sign in to create"), button:has-text("Sign In")');
    await expect(signInPrompt.first()).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Register and login first
    const username = await generateUniqueEmail();
    const password = 'TestPass123!';

    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', username);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    await page.click('[data-testid="register-submit"]');
    await page.waitForURL(/agents|dashboard|login/, { timeout: 10000 });

    // If redirected to login, log in
    if (page.url().includes('/login')) {
      await page.fill('[data-testid="login-username"]', username);
      await page.fill('[data-testid="login-password"]', password);
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/agents|dashboard/, { timeout: 10000 });
    }

    // Click user menu then logout
    await page.click('[data-testid="user-menu-button"]');
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to login
    await page.waitForURL(/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});
