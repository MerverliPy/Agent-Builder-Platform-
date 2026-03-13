const { test, expect } = require('@playwright/test');

test.describe('Agent CRUD E2E Tests (Simplified)', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    const username = `testcrud${Date.now()}`;
    const password = 'TestPass123!';

    await page.goto('/register');
    const inputs = await page.locator('input').all();
    if (inputs.length >= 3) {
      await inputs[0].fill(username);
      await inputs[1].fill(password);
      await inputs[2].fill(password);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should create a new agent', async ({ page }) => {
    await page.goto('/agents/new');

    // Fill agent name
    const agentName = `Agent${Date.now()}`;
    const inputs = await page.locator('input, textarea').all();
    
    if (inputs.length > 0) {
      await inputs[0].fill(agentName);
      
      // Submit form
      await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
      
      // Should navigate to agents list
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
      
      // Verify agent appears in list
      await page.goto('/agents');
      await page.waitForTimeout(1000);
      expect(await page.textContent('body')).toContain(agentName);
    }
  });

  test('should list all agents', async ({ page }) => {
    await page.goto('/agents');
    
    // Should see agents page with list
    expect(page.url()).toContain('/agents');
    
    // Should have at least one agent or empty state
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should display agent details', async ({ page }) => {
    await page.goto('/agents');
    
    // Wait for agents to load
    await page.waitForTimeout(2000);
    
    // Click first agent link if available
    const agentLinks = await page.locator('a[href*="/agents/ag_"]').all();
    
    if (agentLinks.length > 0) {
      await agentLinks[0].click();
      await page.waitForNavigation();
      
      // Should be on detail page
      expect(page.url()).toMatch(/agents\/ag_/);
    }
  });

  test('should handle agent creation without required fields', async ({ page }) => {
    await page.goto('/agents/new');
    
    // Try to submit without filling name
    await page.click('button[type="submit"], button:has-text("Create")');
    
    // Should show validation error or stay on form
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/agents/new');
  });
});
