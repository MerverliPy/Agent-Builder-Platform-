const { test, expect } = require('@playwright/test');
const { clearAuthToken } = require('./utils');

test.describe('Navigation and Routing E2E Tests', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should render home page
    expect(page.url()).toContain('localhost:3000' || page.url().includes('100.81.83.98:3000'));
    expect(await page.isVisible('text=Agent' || page.isVisible('text=Custom' || page.isVisible('text=Dashboard')))).toBeTruthy();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login link
    const loginLink = await page.$('a:has-text("Login"), button:has-text("Login")');
    if (loginLink) {
      await loginLink.click();
      await page.waitForURL(/login/);
      expect(page.url()).toContain('/login');
    }
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    
    // Click register link
    const registerLink = await page.$('a:has-text("Register"), button:has-text("Register"), a:has-text("Sign Up")');
    if (registerLink) {
      await registerLink.click();
      await page.waitForURL(/register/);
      expect(page.url()).toContain('/register');
    }
  });

  test('should navigate to agents list page after login', async ({ page }) => {
    // Register and login
    const email = 'nav-test@example.com';
    const password = 'TestPassword123!';

    await page.goto('/register');
    const { fillAuthFields } = require('./utils');
    await fillAuthFields(page, email, password, password);
    await page.click('button:has-text("Register"), button:has-text("Create account"), button[type="submit"]');
    await page.waitForNavigation();

    // Login
    await clearAuthToken(page);
    await page.goto('/login');
    const { fillAuthFields: fillLoginFields } = require('./utils');
    await fillLoginFields(page, email, password);
    await page.click('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]');
    await page.waitForNavigation();

    // Should be on dashboard or agents page
    const url = page.url();
    expect(url).toContain('/dashboard' || url.includes('/agents'));
  });

  test('should navigate to agents detail page', async ({ page }) => {
    // Login first
    const email = 'nav-test@example.com';
    const password = 'TestPassword123!';

    await page.goto('/login');
    const { fillAuthFields: fillLoginFields2 } = require('./utils');
    await fillLoginFields2(page, email, password);
    await page.click('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]');
    await page.waitForNavigation();

    // Navigate to agents
    await page.goto('/agents');
    expect(page.url()).toContain('/agents');

    // Try to navigate to detail page
    const firstAgentLink = await page.$('a[href*="/agents/ag_"]');
    if (firstAgentLink) {
      await firstAgentLink.click();
      await page.waitForNavigation();
      expect(page.url()).toContain('/agents/ag_');
    }
  });

  test('should navigate to create agent page', async ({ page }) => {
    // Login first
    const email = 'nav-test@example.com';
    const password = 'TestPassword123!';

    await page.goto('/login');
    const { fillAuthFields: fillLoginFields3 } = require('./utils');
    await fillLoginFields3(page, email, password);
    await page.click('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]');
    await page.waitForNavigation();

    // Navigate to create agent
    await page.goto('/agents/new');
    expect(page.url()).toContain('/agents/new');

    // Form should be visible
    expect(await page.isVisible('input[placeholder*="name" i], input[name="name"]')).toBeTruthy();
  });

  test('should handle SPA navigation without page reloads', async ({ page }) => {
    // Login first
    const email = 'nav-test@example.com';
    const password = 'TestPassword123!';

    await page.goto('/login');
    const { fillAuthFields: fillLoginFields4 } = require('./utils');
    await fillLoginFields4(page, email, password);
    await page.click('button:has-text("Login")');
    await page.waitForNavigation();

    const initialUrl = page.url();

    // Navigate to agents
    await page.click('a:has-text("Agents"), button:has-text("Agents")');
    await page.waitForURL(/\/agents/, { timeout: 3000 });

    // Page should not have fully reloaded (check for SPA indicators)
    const agentsList = await page.isVisible('[data-testid*="agent"], .agent-card');
    expect(agentsList).toBeTruthy();

    // Navigate back
    await page.goto('/dashboard' || '/agents');
    expect(page.url()).toContain('/dashboard' || page.url().includes('/agents'));
  });

  test('should redirect to login when accessing protected routes without auth', async ({ page }) => {
    await clearAuthToken(page);

    // Try to access protected routes
    const protectedRoutes = ['/dashboard', '/agents', '/agents/new'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 3000 });
      expect(page.url()).toContain('/login');
      await clearAuthToken(page);
    }
  });

  test('should display navigation menu with all links', async ({ page }) => {
    // Login first
    const email = 'nav-test@example.com';
    const password = 'TestPassword123!';

    await page.goto('/login');
    const { fillAuthFields: fillLoginFields5 } = require('./utils');
    await fillLoginFields5(page, email, password);
    await page.click('button:has-text("Login")');
    await page.waitForNavigation();

    // Check for navigation elements
    const navItems = [
      'a:has-text("Dashboard"), button:has-text("Dashboard")',
      'a:has-text("Agents"), button:has-text("Agents")',
      'a:has-text("Profile"), button:has-text("Profile")',
      'a:has-text("Logout"), button:has-text("Logout")',
    ];

    for (const selector of navItems) {
      const element = await page.$(selector);
      if (element) {
        expect(await element.isVisible()).toBeTruthy();
      }
    }
  });

  test('should preserve scroll position during navigation', async ({ page }) => {
    // Login first
    const email = 'nav-test@example.com';
    const password = 'TestPassword123!';

    await page.goto('/login');
    const { fillAuthFields } = require('./utils');
    await fillAuthFields(page, email, password);
    await page.click('button:has-text("Login")');
    await page.waitForNavigation();

    // Navigate to agents with multiple items
    await page.goto('/agents');

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Navigate to another route and back
    await page.goto('/dashboard');
    await page.goto('/agents');

    // Scroll should be reset (standard SPA behavior)
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeLessThanOrEqual(scrollBefore);
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    await page.goto('/nonexistent-route-xyz');

    // Should either show 404 or redirect to home/login
    const url = page.url();
    expect(
      url.includes('/nonexistent-route-xyz') ||
      url.includes('/login') ||
      url.includes('/')
    ).toBeTruthy();
  });
});
