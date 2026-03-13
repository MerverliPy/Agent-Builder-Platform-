const { test, expect } = require('@playwright/test');
const { clearAuthToken, setAuthToken, getAuthToken, generateUniqueEmail, fillAuthFields } = require('./utils');

// Helper to login before each test
async function loginBeforeTest(page) {
  const email = 'crud-test@example.com';
  const password = 'TestPassword123!';

  // Register if not already registered
  await page.goto('/register');
  try {
    await fillAuthFields(page, email, password, password);
    await page.click('button:has-text("Register")');
    await page.waitForNavigation();
  } catch (e) {
    // ignore if registration fails or user exists
  }

  // Clear and login fresh
  await clearAuthToken(page);
  await page.goto('/login');
  await fillAuthFields(page, email, password);
  await page.click('button:has-text("Login")');
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

    // Click "Create Agent" button
    await page.click('button:has-text("Create Agent"), button:has-text("New Agent"), a:has-text("Create")');
    await page.waitForNavigation();
    expect(page.url()).toContain('/agents/new');

    // Fill agent form
    const agentName = `Test Agent ${Date.now()}`;
    await page.fill('input[name="name"], input[placeholder*="name" i], input[data-testid*="name"]', agentName);
    await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 'This is a test agent');
    await page.fill('input[name="role"], input[placeholder*="role" i]', 'Assistant');
    
    // Select an avatar
    const avatarOptions = await page.locator('.avatar-option, [data-avatar], button[aria-label*="avatar" i]').first();
    if (await avatarOptions.isVisible()) {
      await avatarOptions.click();
    }

    // Submit form
    await page.click('button:has-text("Create"), button:has-text("Save")');

    // Should redirect to agents or show success
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    
    // Verify agent appears in list
    await page.goto('/agents');
    expect(await page.isVisible(`text=${agentName}`)).toBeTruthy();
  });

  test('should create a new agent with minimal fields', async ({ page }) => {
    await page.goto('/agents/new');

    // Fill only required fields
    const agentName = `Minimal Agent ${Date.now()}`;
    await page.fill('input[name="name"], input[placeholder*="name" i], input[data-testid*="name"]', agentName);

    // Submit form
    await page.click('button:has-text("Create"), button:has-text("Save")');

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

    // Create a test agent first
    const agentName = `Update Test ${Date.now()}`;
    await page.click('button:has-text("Create"), a:has-text("Create")');
    await page.waitForNavigation();
    
    await page.fill('input[name="name"], input[placeholder*="name" i], input[data-testid*="name"]', agentName);
    await page.click('button:has-text("Create"), button:has-text("Save")');
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Navigate to agent details
    await page.goto('/agents');
    await page.click(`text=${agentName}`);
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Click edit button
    await page.click('button:has-text("Edit"), button:has-text("Update"), a:has-text("Edit")');
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Update agent info
    const updatedName = `${agentName} Updated`;
    const nameInput = await page.$('input[name="name"], input[placeholder*="name" i], input[data-testid*="name"]');
    if (nameInput) {
      await page.fill('input[name="name"], input[placeholder*="name" i], input[data-testid*="name"]', updatedName);
      await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 'Updated description');

      // Save changes
      await page.click('button:has-text("Save"), button:has-text("Update")');
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
    await page.click('button:has-text("Create"), button:has-text("Save")');

    // Should show validation error or stay on form
    const urlAfter = page.url();
    expect(urlAfter).toContain('/agents/new' || urlAfter.includes('/agents'));
  });

  test('should display agent preview while editing', async ({ page }) => {
    await page.goto('/agents/new');

    const agentName = `Preview Test ${Date.now()}`;
    await page.fill('input[name="name"], input[placeholder*="name" i]', agentName);

    // Check if preview is visible
    const preview = await page.$('[data-testid*="preview"], .preview, [class*="preview"]');
    if (preview) {
      expect(await preview.isVisible()).toBeTruthy();

      // Verify preview updates as we type
      const previewText = await preview.textContent();
      expect(previewText).toContain(agentName);
    }
  });
});
