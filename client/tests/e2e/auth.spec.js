const { test, expect } = require('@playwright/test');
const { clearAuthToken, setAuthToken, getAuthToken, getCurrentUser, generateUniqueEmail, fillForm } = require('./utils');

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth data
    await clearAuthToken(page);
  });

  test('should register a new user successfully', async ({ page }) => {
    const email = await generateUniqueEmail();
    const password = 'TestPassword123!';

    await page.goto('/');
    await page.click('a:has-text("Register")');
    await expect(page).toHaveURL('/register');

    // Fill registration form
    const { fillAuthFields } = require('./utils');
    await fillAuthFields(page, email, password, password);
    
    // Submit form
    await page.click('button:has-text("Register"), button:has-text("Create account"), button[type="submit"]');
    
    // Should redirect to login or dashboard
    await page.waitForNavigation();
    expect(['/login', '/dashboard', '/agents']).toContain(page.url().split('?')[0].replace(/.*:3000/, ''));
  });

  test('should login with valid credentials', async ({ page }) => {
    const email = 'test@example.com';
    const password = 'TestPassword123!';

    // First register the user
    await page.goto('/register');
    const { fillAuthFields: fillAuthFields2 } = require('./utils');
    await fillAuthFields2(page, email, password, password);
    await page.click('button:has-text("Register"), button:has-text("Create account"), button[type="submit"]');
    await page.waitForNavigation();

    // Clear auth to test login
    await clearAuthToken(page);
    await page.goto('/login');

    // Login with credentials
    const { fillAuthFields: fillAuthFields3 } = require('./utils');
    await fillAuthFields3(page, email, password);
    await page.click('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]');

    // Should be redirected to dashboard
    await page.waitForNavigation();
    const url = page.url();
    expect(url).toContain('/dashboard' || url.includes('/agents'));

    // Token should be stored
    const token = await getAuthToken(page);
    expect(token).toBeTruthy();
  });

  test('should not login with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Try login with wrong credentials
    const { fillAuthFields: fillAuthFields4 } = require('./utils');
    await fillAuthFields4(page, 'nonexistent@example.com', 'WrongPassword123!');
    await page.click('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]');

    // Should show error message
    await page.waitForSelector('text=Invalid email or password', { timeout: 5000 });
    expect(await page.isVisible('text=Invalid email or password')).toBeTruthy();

    // Token should not be stored
    const token = await getAuthToken(page);
    expect(token).toBeFalsy();
  });

  test('should handle login with empty fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit form with empty fields
    await page.click('button:has-text("Login")');

    // Should show validation errors
    const emailInput = await page.locator('input[data-testid*="username"], input[type="email"]');
    const isInvalid = await emailInput.evaluate(el => el.validity.valid);
    expect(!isInvalid).toBeTruthy();
  });

  test('should logout successfully', async ({ page }) => {
    const email = 'test@example.com';
    const password = 'TestPassword123!';

    // Register and login
    await page.goto('/register');
    const { fillAuthFields: fillAuthFields5 } = require('./utils');
    await fillAuthFields5(page, email, password, password);
    await page.click('button:has-text("Register"), button:has-text("Create account"), button[type="submit"]');
    await page.waitForNavigation();

    // Verify we're logged in
    let token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Find and click logout button
    await page.click('button:has-text("Logout"), a:has-text("Logout")');
    await page.waitForNavigation();

    // Should be redirected to login or home
    const url = page.url();
    expect(['/login', '/']).toContain(url.split('?')[0].replace(/.*:3000/, ''));

    // Token should be cleared
    token = await getAuthToken(page);
    expect(token).toBeFalsy();
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    await clearAuthToken(page);
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/login/);
    expect(page.url()).toContain('/login');
  });

  test('should redirect to login when token is invalid', async ({ page }) => {
    // Set an invalid token
    await setAuthToken(page, 'invalid-token-xyz', { id: 'user123', email: 'test@example.com' });
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to login due to invalid token
    await page.waitForURL(/login/, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    const email = 'test@example.com';
    const password = 'TestPassword123!';

    // Register and login
    await page.goto('/register');
    const { fillAuthFields: fillAuthFields6 } = require('./utils');
    await fillAuthFields6(page, email, password, password);
    await page.click('button:has-text("Register"), button:has-text("Create account"), button[type="submit"]');
    await page.waitForNavigation();

    // Get initial token
    const tokenBefore = await getAuthToken(page);
    expect(tokenBefore).toBeTruthy();

    // Reload page
    await page.reload();

    // Token should still be there
    const tokenAfter = await getAuthToken(page);
    expect(tokenAfter).toBe(tokenBefore);

    // Should still have access to protected routes
    await page.goto('/dashboard');
    expect(page.url()).toContain('/dashboard' || page.url().includes('/agents'));
  });
});
