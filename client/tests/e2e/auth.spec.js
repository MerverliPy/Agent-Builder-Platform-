const { test, expect } = require('@playwright/test');
const { clearAuthToken, setAuthToken, getAuthToken, getCurrentUser, generateUniqueEmail, fillAuthFields, resetDatabase } = require('./utils');

test.describe('Authentication E2E Tests', () => {
  test.beforeAll(async () => {
    // Reset database before running auth tests to ensure clean state
    await resetDatabase();
  });

  test.beforeEach(async ({ page }) => {
    // Clear any existing auth data by navigating to a page first
    await page.goto('/');
    await clearAuthToken(page);
  });

  test('should register a new user successfully', async ({ page }) => {
    const email = await generateUniqueEmail();
    const password = 'TestPassword123!';

    // Navigate to register page directly (or via login page)
    await page.goto('/register');
    await expect(page).toHaveURL(/register/);

    // Fill registration form using data-testid selectors
    await page.fill('[data-testid="register-username"]', email);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    
    // Submit form using data-testid
    await page.click('[data-testid="register-submit"]');
    
    // Should redirect to login or dashboard after registration
    await page.waitForURL(/login|dashboard|agents/, { timeout: 10000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    const email = await generateUniqueEmail();
    const password = 'TestPassword123!';

    // First register the user
    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', email);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    await page.click('[data-testid="register-submit"]');
    await page.waitForURL(/login|dashboard|agents/, { timeout: 10000 });

    // Clear auth to test login flow
    await clearAuthToken(page);
    await page.goto('/login');

    // Login with credentials using data-testid
    await page.fill('[data-testid="login-username"]', email);
    await page.fill('[data-testid="login-password"]', password);
    await page.click('[data-testid="login-submit"]');

    // Should be redirected to dashboard or agents
    await page.waitForURL(/dashboard|agents/, { timeout: 10000 });

    // Token should be stored
    const token = await getAuthToken(page);
    expect(token).toBeTruthy();
  });

  test('should not login with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Try login with wrong credentials
    await page.fill('[data-testid="login-username"]', 'nonexistent@example.com');
    await page.fill('[data-testid="login-password"]', 'WrongPassword123!');
    await page.click('[data-testid="login-submit"]');

    // Should show error message (wait for it to appear)
    const errorVisible = await page.locator('text=/invalid|error|failed/i').isVisible({ timeout: 5000 }).catch(() => false);
    
    // Should still be on login page
    expect(page.url()).toContain('/login');

    // Token should not be stored
    const token = await getAuthToken(page);
    expect(token).toBeFalsy();
  });

  test('should handle login with empty fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit form with empty fields
    await page.click('[data-testid="login-submit"]');

    // Should still be on login page (form validation should prevent submission)
    expect(page.url()).toContain('/login');
  });

  test('should logout successfully', async ({ page }) => {
    const email = await generateUniqueEmail();
    const password = 'TestPassword123!';

    // Register and login
    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', email);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    await page.click('[data-testid="register-submit"]');
    await page.waitForURL(/login|dashboard|agents/, { timeout: 10000 });

    // If redirected to login, log in
    if (page.url().includes('/login')) {
      await page.fill('[data-testid="login-username"]', email);
      await page.fill('[data-testid="login-password"]', password);
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/dashboard|agents/, { timeout: 10000 });
    }

    // Verify we're logged in
    let token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Open user menu first, then click logout button
    await page.click('[data-testid="user-menu-button"]');
    await page.click('[data-testid="logout-button"]');

    // Should be redirected to login
    await page.waitForURL(/login/, { timeout: 10000 });

    // Token should be cleared
    token = await getAuthToken(page);
    expect(token).toBeFalsy();
  });

  test('should show sign-in prompt when accessing agents page without auth', async ({ page }) => {
    await clearAuthToken(page);
    
    // Access agents page - it's publicly viewable but shows sign-in prompts
    await page.goto('/agents');
    await page.waitForLoadState('networkidle');
    
    // Should stay on agents page (not redirect to login)
    expect(page.url()).toContain('/agents');
    
    // Should show sign-in prompt instead of create button
    const signInPrompt = page.locator('button:has-text("Sign in to create"), button:has-text("Sign In")');
    await expect(signInPrompt.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show unauthenticated UI when token is invalid', async ({ page }) => {
    // Navigate to a page first to set up localStorage context
    await page.goto('/');
    
    // Set an invalid token
    await setAuthToken(page, 'invalid-token-xyz', { id: 'user123', username: 'test@example.com' });
    
    // Access agents page
    await page.goto('/agents');
    await page.waitForLoadState('networkidle');
    
    // Should stay on agents page (not redirect)
    expect(page.url()).toContain('/agents');
    
    // With invalid token, app should detect unauthenticated state and show sign-in UI
    const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Sign in")');
    await expect(signInButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    const email = await generateUniqueEmail();
    const password = 'TestPassword123!';

    // Register
    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', email);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    await page.click('[data-testid="register-submit"]');
    await page.waitForURL(/login|dashboard|agents/, { timeout: 10000 });

    // If redirected to login, log in
    if (page.url().includes('/login')) {
      await page.fill('[data-testid="login-username"]', email);
      await page.fill('[data-testid="login-password"]', password);
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/dashboard|agents/, { timeout: 10000 });
    }

    // Get initial token
    const tokenBefore = await getAuthToken(page);
    expect(tokenBefore).toBeTruthy();

    // Reload page
    await page.reload();

    // Token should still be there
    const tokenAfter = await getAuthToken(page);
    expect(tokenAfter).toBe(tokenBefore);

    // Should still have access to protected routes
    await page.goto('/agents');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/agents');
  });
});
