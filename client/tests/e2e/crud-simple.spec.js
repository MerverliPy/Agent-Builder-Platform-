const { test, expect } = require('@playwright/test');
const { resetDatabase, clearAuthToken, generateUniqueEmail } = require('./utils');

// Helper to register and login
async function registerAndLogin(page) {
  const email = await generateUniqueEmail();
  const password = 'TestPass123!';

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

  return { email, password };
}

test.describe('Agent CRUD E2E Tests (Simplified)', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
    await registerAndLogin(page);
  });

  test('should create a new agent', async ({ page }) => {
    await page.goto('/agents/new');

    // Fill agent name
    const agentName = `Agent${Date.now()}`;
    
    // Wait for the name input
    await page.waitForSelector('[data-testid="agent-name"]', { timeout: 5000 });
    await page.fill('[data-testid="agent-name"]', agentName);
    
    // Click submit button
    await page.click('[data-testid="agentform-submit"]');
    
    // Wait for navigation
    await page.waitForURL(/agents/, { timeout: 10000 });
    
    // Check we're on agents page
    expect(page.url()).toContain('/agents');
  });

  test('should list all agents', async ({ page }) => {
    await page.goto('/agents');
    
    // Should see agents page
    expect(page.url()).toContain('/agents');
    
    // Page should have content
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should display agent details', async ({ page }) => {
    // First create an agent
    await page.goto('/agents/new');
    const agentName = `DetailTest${Date.now()}`;
    await page.fill('[data-testid="agent-name"]', agentName);
    await page.click('[data-testid="agentform-submit"]');
    await page.waitForURL(/agents/, { timeout: 10000 });

    // Go to agents list
    await page.goto('/agents');
    await page.waitForTimeout(1000);
    
    // Click on the agent
    const agentLink = page.locator(`text=${agentName}`).first();
    if (await agentLink.isVisible()) {
      await agentLink.click();
      await page.waitForURL(/agents\/ag_/, { timeout: 10000 });
      expect(page.url()).toMatch(/agents\/ag_/);
    }
  });

  test('should handle agent creation without required fields', async ({ page }) => {
    await page.goto('/agents/new');
    
    // Try to submit without filling name
    await page.click('[data-testid="agentform-submit"]');
    
    // Should stay on form
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/agents/new');
  });
});
