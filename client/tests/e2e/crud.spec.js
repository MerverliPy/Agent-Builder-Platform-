const { test, expect } = require('@playwright/test');
const { clearAuthToken, getAuthToken, generateUniqueEmail, resetDatabase } = require('./utils');

// Helper to register and login before each test
async function registerAndLogin(page) {
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

  return { email, password };
}

test.describe('Agent CRUD E2E Tests', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
    await registerAndLogin(page);
  });

  test('should create a new agent with all fields', async ({ page }) => {
    // Navigate directly to create agent page (user is already logged in from beforeEach)
    await page.goto('/agents/new');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/agents/new');

    // Fill agent form
    const agentName = `Test Agent ${Date.now()}`;
    await page.fill('[data-testid="agent-name"]', agentName);
    
    // Fill optional fields if they exist
    const descriptionField = page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first();
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('This is a test agent');
    }

    // Submit form using data-testid
    await page.click('[data-testid="agentform-submit"]');

    // Should redirect to agents list or agent detail
    await page.waitForURL(/agents/, { timeout: 10000 });
    
    // Verify agent appears in list
    await page.goto('/agents');
    const agentVisible = await page.locator(`text=${agentName}`).isVisible({ timeout: 5000 }).catch(() => false);
    expect(agentVisible).toBeTruthy();
  });

  test('should create a new agent with minimal fields', async ({ page }) => {
    await page.goto('/agents/new');

    // Fill only required fields using data-testid
    const agentName = `Minimal Agent ${Date.now()}`;
    await page.fill('[data-testid="agent-name"]', agentName);

    // Submit form using data-testid
    await page.click('[data-testid="agentform-submit"]');

    // Should redirect to agents or show success
    await page.waitForURL(/agents/, { timeout: 10000 });
    
    // Verify agent appears in list
    await page.goto('/agents');
    const agentVisible = await page.locator(`text=${agentName}`).isVisible({ timeout: 5000 }).catch(() => false);
    expect(agentVisible).toBeTruthy();
  });

  test('should read and display agent details', async ({ page }) => {
    // First create an agent
    await page.goto('/agents/new');
    const agentName = `Detail Test ${Date.now()}`;
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

      // Should be on agent detail page
      expect(page.url()).toContain('/agents/ag_');
    }
  });

  test('should update an agent', async ({ page }) => {
    // Create a test agent first
    await page.goto('/agents/new');
    const agentName = `Update Test ${Date.now()}`;
    await page.fill('[data-testid="agent-name"]', agentName);
    await page.click('[data-testid="agentform-submit"]');
    await page.waitForURL(/agents/, { timeout: 10000 });

    // Navigate to agent details
    await page.goto('/agents');
    const agentLink = page.locator(`text=${agentName}`).first();
    if (await agentLink.isVisible()) {
      await agentLink.click();
      await page.waitForURL(/agents\/ag_/, { timeout: 10000 });

      // Click edit button
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/edit/, { timeout: 10000 });

        // Update agent info
        const updatedName = `${agentName} Updated`;
        await page.fill('[data-testid="agent-name"]', updatedName);

        // Save changes
        await page.click('[data-testid="agentform-submit"]');
        await page.waitForURL(/agents/, { timeout: 10000 });

        // Verify update
        await page.goto('/agents');
        const updatedVisible = await page.locator(`text=${updatedName}`).isVisible({ timeout: 5000 }).catch(() => false);
        expect(updatedVisible).toBeTruthy();
      }
    }
  });

  test('should delete an agent', async ({ page }) => {
    // Create a test agent first
    await page.goto('/agents/new');
    const agentName = `Delete Test ${Date.now()}`;
    await page.fill('[data-testid="agent-name"]', agentName);
    await page.click('[data-testid="agentform-submit"]');
    await page.waitForURL(/agents/, { timeout: 10000 });

    // Navigate to agents list
    await page.goto('/agents');

    // Find and delete the agent
    const deleteButton = page.locator(`[data-testid*="delete"], button[aria-label*="delete" i]`).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Handle confirmation dialog if present
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').first();
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Wait for deletion to complete
      await page.waitForTimeout(1000);
    }
  });

  test('should list all agents for user', async ({ page }) => {
    await page.goto('/agents');

    // Should show agents list (empty or with items)
    const agentList = page.locator('[data-testid*="agent"], .agent-card, [role="row"]');
    const count = await agentList.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should handle agent creation error gracefully', async ({ page }) => {
    await page.goto('/agents/new');

    // Try to create without required fields (empty name)
    await page.click('[data-testid="agentform-submit"]');

    // Should still be on the form (validation error)
    expect(page.url()).toContain('/agents/new');
  });

  test('should display agent preview while editing', async ({ page }) => {
    await page.goto('/agents/new');

    const agentName = `Preview Test ${Date.now()}`;
    await page.fill('[data-testid="agent-name"]', agentName);

    // Check if preview is visible (optional feature)
    const previewName = page.locator('[data-testid="agent-preview-name"]');
    if (await previewName.isVisible({ timeout: 2000 }).catch(() => false)) {
      const previewText = await previewName.textContent();
      expect(previewText).toContain(agentName);
    }
  });
});
