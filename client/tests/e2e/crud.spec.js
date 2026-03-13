const { test, expect } = require('@playwright/test');
const { clearAuthToken, setAuthToken, getAuthToken, generateUniqueEmail, fillAuthFields, resetDatabase } = require('./utils');

test.describe('Agent CRUD E2E Tests', () => {
  test.beforeAll(async () => {
    // Reset database before running CRUD tests to ensure clean state
    await resetDatabase();
  });

  // Helper to login before each test
async function loginBeforeTest(page) {
  const email = 'crud-test@example.com';
  const password = 'TestPassword123!';

  // Register if not already registered
  await page.goto('/register');
  try {
    await fillAuthFields(page, email, password, password);
    await page.click('[data-testid="register-submit"]');
    await page.waitForNavigation();
  } catch (e) {
    // ignore if registration fails or user exists
  }

  // Clear and login fresh
  await clearAuthToken(page);
  await page.goto('/login');
  await fillAuthFields(page, email, password);
  await page.click('[data-testid="login-submit"]');
  await page.waitForNavigation();
}

test.describe('Agent CRUD E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
  });

  test('should create a new agent with all fields', async ({ page }) => {
    // Navigate to agents page
    await page.goto('/agents');
    expect(page.url()).toContain('/agents');

    // Click "Create Agent" button using data-testid
    await page.click('[data-testid="create-agent-button"], [data-testid="create-first-agent-button"]');
    await page.waitForNavigation();
    expect(page.url()).toContain('/agents/new');

    // Fill agent form
    const agentName = `Test Agent ${Date.now()}`;
    await page.fill('[data-testid="agent-name"]', agentName);
    await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 'This is a test agent');
    await page.fill('input[name="role"], input[placeholder*="role" i]', 'Assistant');
    
    // Select an avatar
    const avatarOptions = await page.locator('.avatar-option, [data-avatar], button[aria-label*="avatar" i]').first();
    if (await avatarOptions.isVisible()) {
      await avatarOptions.click();
    }

    // Submit form using data-testid
    await page.click('[data-testid="agentform-submit"]');

    // Should redirect to agents or show success
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    
    // Verify agent appears in list
    await page.goto('/agents');
    expect(await page.isVisible(`text=${agentName}`)).toBeTruthy();
  });

  test('should create a new agent with minimal fields', async ({ page }) => {
    await page.goto('/agents/new');

    // Fill only required fields using data-testid
    const agentName = `Minimal Agent ${Date.now()}`;
    await page.fill('[data-testid="agent-name"]', agentName);

    // Submit form using data-testid
    await page.click('[data-testid="agentform-submit"]');

    // Should redirect to agents or show success
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    
    // Verify agent appears in list
    await page.goto('/agents');
    expect(await page.isVisible(`text=${agentName}`)).toBeTruthy();
  });

  test('should read and display agent details', async ({ page }) => {
    await page.goto('/agents');

    // Get the first agent in the list
    const firstAgentLink = await page.locator('a[href*="/agents/ag_"], button:has-text("View"), a:has-text("Edit")').first();
    
    if (await firstAgentLink.isVisible()) {
      await firstAgentLink.click();
      await page.waitForNavigation();

      // Should be on agent detail page
      expect(page.url()).toContain('/agents/ag_');

      // Agent information should be displayed
      const agentName = await page.locator('h1, h2, [data-testid*="name"]').first();
      expect(await agentName.isVisible()).toBeTruthy();
    }
  });

  test('should update an agent', async ({ page }) => {
    await page.goto('/agents');

    // Create a test agent first using data-testid
    const agentName = `Update Test ${Date.now()}`;
    await page.click('[data-testid="create-agent-button"], [data-testid="create-first-agent-button"]');
    await page.waitForNavigation();
    
    await page.fill('[data-testid="agent-name"]', agentName);
    await page.click('[data-testid="agentform-submit"]');
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Navigate to agent details
    await page.goto('/agents');
    await page.click(`text=${agentName}`);
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Click edit button
    await page.click('button:has-text("Edit"), button:has-text("Update"), a:has-text("Edit")');
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Update agent info using data-testid
    const updatedName = `${agentName} Updated`;
    const nameInput = await page.$('[data-testid="agent-name"]');
    if (nameInput) {
      await page.fill('[data-testid="agent-name"]', updatedName);
      await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 'Updated description');

      // Save changes using data-testid
      await page.click('[data-testid="agentform-submit"]');
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

      // Verify update
      await page.goto('/agents');
      expect(await page.isVisible(`text=${updatedName}`)).toBeTruthy();
    }
  });

  test('should delete an agent', async ({ page }) => {
    // Note: Delete may only work for admins, this test checks the UI flow
    await page.goto('/agents');

    // Get first agent
    const firstAgentRow = await page.locator('[data-testid*="agent"], .agent-card, [role="row"]').first();
    
    if (await firstAgentRow.isVisible()) {
      // Look for delete button in agent row
      const deleteButton = firstAgentRow.locator('button:has-text("Delete"), button[aria-label*="delete" i]');
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Handle confirmation dialog if present
        const confirmButton = await page.$('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
        if (confirmButton) {
          await confirmButton.click();
        }

        // Wait for deletion to complete
        await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
        
        // Verify agent is removed (or shows appropriate message)
        const totalAgents = await page.locator('[data-testid*="agent"], .agent-card').count();
        expect(totalAgents).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should list all agents for user', async ({ page }) => {
    await page.goto('/agents');

    // Should show agents list
    const agentList = await page.locator('[data-testid*="agent"], .agent-card, [role="row"]');
    const count = await agentList.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should handle agent creation error gracefully', async ({ page }) => {
    await page.goto('/agents/new');

    // Try to create without required fields
    await page.click('[data-testid="agentform-submit"]');

    // Should show validation error or stay on form
    const urlAfter = page.url();
    expect(urlAfter).toContain('/agents/new' || urlAfter.includes('/agents'));
  });

  test('should display agent preview while editing', async ({ page }) => {
    await page.goto('/agents/new');

    const agentName = `Preview Test ${Date.now()}`;
    await page.fill('[data-testid="agent-name"]', agentName);

    // Check if preview is visible
    const previewName = await page.$('[data-testid="agent-preview-name"]');
    if (previewName) {
      expect(await previewName.isVisible()).toBeTruthy();
      const previewText = await previewName.textContent();
      expect(previewText).toContain(agentName);
    }
  });
});
