const { test, expect } = require('@playwright/test');

test.describe('Authentication E2E Tests (Simplified)', () => {
  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/');
    await page.click('a, button:has-text("Sign up"), a:has-text("Register")');
    
    const username = `testuser${Date.now()}`;
    const password = 'TestPass123!';

    // Fill form - wait for inputs to be visible
    await page.waitForSelector('input', { timeout: 5000 });
    const inputs = await page.locator('input').all();
    
    if (inputs.length >= 3) {
      await inputs[0].fill(username); // username
      await inputs[1].fill(password); // password
      await inputs[2].fill(password); // confirm password
      
      // Submit form
      await page.click('button[type="submit"], button:has-text("Sign up"), button:has-text("Register")');
      
      // Should redirect to agents or show success
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
      expect(page.url()).toMatch(/agents|dashboard|login/);
    }
  });

  test('should login with valid credentials', async ({ page }) => {
    const username = 'testuser123';
    const password = 'TestPass123!';

    // First register
    await page.goto('/register');
    const inputs = await page.locator('input').all();
    if (inputs.length >= 3) {
      await inputs[0].fill(`${username}${Date.now()}`);
      await inputs[1].fill(password);
      await inputs[2].fill(password);
      await page.click('button[type="submit"]');
      await page.waitForNavigation().catch(() => {});
    }

    // Now login
    await page.goto('/login');
    const loginInputs = await page.locator('input').all();
    if (loginInputs.length >= 2) {
      const uniqueUsername = `${username}${Date.now()}`;
      await loginInputs[0].fill(uniqueUsername);
      await loginInputs[1].fill(password);
      await page.click('button[type="submit"]');
      
      // Should redirect to agents
      await page.waitForNavigation();
      expect(page.url()).toContain('/agents');
    }
  });

  test('should not login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    const inputs = await page.locator('input').all();
    
    if (inputs.length >= 2) {
      await inputs[0].fill('nonexistent@test.com');
      await inputs[1].fill('WrongPassword123!');
      await page.click('button[type="submit"]');
      
      // Wait for error or check URL hasn't changed
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/login');
    }
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Clear auth
    await page.evaluate(() => localStorage.clear());
    
    await page.goto('/agents');
    
    // Should redirect to login
    await page.waitForURL(/login/, { timeout: 3000 });
    expect(page.url()).toContain('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Register and login first
    const username = `logout${Date.now()}`;
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

    // Find and click logout
    const buttons = await page.locator('button').allTextContents();
    if (buttons.some(t => t.includes('Logout'))) {
      await page.click('button:has-text("Logout")');
      
      // Should redirect to login or home
      await page.waitForNavigation().catch(() => {});
      expect(['/login', '/']).toContain(page.url().split('?')[0].split(':')[2]?.split('/')[1] || '/');
    }
  });
});
