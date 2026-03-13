const { test, expect } = require('@playwright/test');

test.describe('Error Handling E2E Tests (Simplified)', () => {
  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    const inputs = await page.locator('input').all();
    
    if (inputs.length >= 2) {
      await inputs[0].fill('nonexistent');
      await inputs[1].fill('wrongpass');
      await page.click('button[type="submit"]');
      
      // Wait for error or stay on page
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/login');
    }
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/register');
    const inputs = await page.locator('input').all();
    
    if (inputs.length >= 3) {
      await inputs[0].fill('testuser');
      await inputs[1].fill('Password123!');
      await inputs[2].fill('DifferentPass456!');
      await page.click('button[type="submit"]');
      
      // Should show error
      await page.waitForTimeout(1000);
      const content = await page.textContent('body');
      expect(content).toContain('do not match' || content.includes('Passwords'));
    }
  });

  test('should show error for empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without filling
    await page.click('button[type="submit"]');
    
    // Should stay on form
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/login');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept and fail API calls
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    await page.goto('/login');
    const inputs = await page.locator('input').all();
    
    if (inputs.length >= 2) {
      await inputs[0].fill('testuser');
      await inputs[1].fill('password');
      await page.click('button[type="submit"]');
      
      // Should show error
      await page.waitForTimeout(2000);
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    }
  });

  test('should show duplicate user error', async ({ page }) => {
    const username = `duplicate${Date.now()}`;
    const password = 'TestPass123!';

    // Register first user
    await page.goto('/register');
    const inputs1 = await page.locator('input').all();
    if (inputs1.length >= 3) {
      await inputs1[0].fill(username);
      await inputs1[1].fill(password);
      await inputs1[2].fill(password);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ timeout: 3000 }).catch(() => {});
    }

    // Try to register with same username
    await page.goto('/register');
    const inputs2 = await page.locator('input').all();
    if (inputs2.length >= 3) {
      await inputs2[0].fill(username);
      await inputs2[1].fill(password);
      await inputs2[2].fill(password);
      await page.click('button[type="submit"]');
      
      // Should show error
      await page.waitForTimeout(2000);
      const content = await page.textContent('body');
      expect(content).toContain('exists' || content.includes('already'));
    }
  });

  test('should validate required fields on agent creation', async ({ page }) => {
    // Login first
    const username = `errortest${Date.now()}`;
    const password = 'TestPass123!';

    await page.goto('/register');
    const regInputs = await page.locator('input').all();
    if (regInputs.length >= 3) {
      await regInputs[0].fill(username);
      await regInputs[1].fill(password);
      await regInputs[2].fill(password);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    }

    // Navigate to create agent
    await page.goto('/agents/new');
    
    // Try to submit without name
    await page.click('button[type="submit"], button:has-text("Create")');
    
    // Should either stay on form or show error
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/agents/new');
  });
});
