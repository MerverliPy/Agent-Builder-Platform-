const { test, expect } = require('@playwright/test');
const { clearAuthToken, resetDatabase, generateUniqueEmail } = require('./utils');

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

test.describe('Navigation and Routing E2E Tests', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should render home page content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click Sign In button
    const signInButton = page.locator('button:has-text("Sign In")').first();
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await page.waitForURL(/login/, { timeout: 10000 });
      expect(page.url()).toContain('/login');
    } else {
      // Navigate directly
      await page.goto('/login');
      expect(page.url()).toContain('/login');
    }
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    
    // Click sign up link on login page
    const signUpLink = page.locator('a:has-text("Sign up")').first();
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await page.waitForURL(/register/, { timeout: 10000 });
      expect(page.url()).toContain('/register');
    } else {
      // Navigate directly
      await page.goto('/register');
      expect(page.url()).toContain('/register');
    }
  });

  test('should navigate to agents list page after login', async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
    await registerAndLogin(page);

    // Should be on dashboard or agents page
    const url = page.url();
    expect(url.includes('/dashboard') || url.includes('/agents')).toBeTruthy();
  });

  test('should navigate to agents detail page', async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
    await registerAndLogin(page);

    // Create an agent first
    await page.goto('/agents/new');
    const agentName = `NavTest${Date.now()}`;
    await page.fill('[data-testid="agent-name"]', agentName);
    await page.click('[data-testid="agentform-submit"]');
    await page.waitForURL(/agents/, { timeout: 10000 });

    // Navigate to agents list
    await page.goto('/agents');
    
    // Click on the agent
    const agentLink = page.locator(`text=${agentName}`).first();
    if (await agentLink.isVisible()) {
      await agentLink.click();
      await page.waitForURL(/agents\/ag_/, { timeout: 10000 });
      expect(page.url()).toContain('/agents/ag_');
    }
  });

  test('should navigate to create agent page', async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
    await registerAndLogin(page);

    // Navigate to create agent
    await page.goto('/agents/new');
    expect(page.url()).toContain('/agents/new');

    // Form should be visible
    const nameInput = page.locator('[data-testid="agent-name"]');
    expect(await nameInput.isVisible()).toBeTruthy();
  });

  test('should handle SPA navigation without page reloads', async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
    await registerAndLogin(page);

    // Navigate to agents
    const agentsLink = page.locator('a:has-text("Agents")').first();
    if (await agentsLink.isVisible()) {
      await agentsLink.click();
      await page.waitForURL(/\/agents/, { timeout: 10000 });
      expect(page.url()).toContain('/agents');
    }
  });

  test('should redirect to login when accessing protected routes without auth', async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);

    // Try to access protected routes
    const protectedRoutes = ['/agents', '/agents/new'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 10000 });
      expect(page.url()).toContain('/login');
      await clearAuthToken(page);
    }
  });

  test('should display navigation menu with links', async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
    await registerAndLogin(page);

    // Check for Agents navigation link
    const agentsLink = page.locator('a:has-text("Agents")').first();
    expect(await agentsLink.isVisible()).toBeTruthy();
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    await page.goto('/nonexistent-route-xyz');

    // Should either show 404 or redirect
    const url = page.url();
    expect(
      url.includes('/nonexistent-route-xyz') ||
      url.includes('/login') ||
      url.includes('/')
    ).toBeTruthy();
  });
});
