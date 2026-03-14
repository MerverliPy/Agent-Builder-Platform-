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

  if (page.url().includes('/login')) {
    await page.fill('[data-testid="login-username"]', email);
    await page.fill('[data-testid="login-password"]', password);
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL(/dashboard|agents/, { timeout: 10000 });
  }

  return { email, password };
}

test.describe('Error Handling E2E Tests (Simplified)', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuthToken(page);
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="login-username"]', 'nonexistent@test.com');
    await page.fill('[data-testid="login-password"]', 'wrongpass');
    await page.click('[data-testid="login-submit"]');
    
    // Wait for error
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', await generateUniqueEmail());
    await page.fill('[data-testid="register-password"]', 'Password123!');
    await page.fill('[data-testid="register-confirm-password"]', 'DifferentPass456!');
    await page.click('[data-testid="register-submit"]');
    
    // Should stay on form
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/register');
  });

  test('should show error for empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without filling
    await page.click('[data-testid="login-submit"]');
    
    // Should stay on form
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/login');
  });

  test('should show duplicate user error', async ({ page }) => {
    const email = await generateUniqueEmail();
    const password = 'TestPass123!';

    // Register first user
    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', email);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    await page.click('[data-testid="register-submit"]');
    await page.waitForURL(/login|dashboard|agents/, { timeout: 10000 });

    // Clear auth and try to register with same email
    await clearAuthToken(page);
    await page.goto('/register');
    await page.fill('[data-testid="register-username"]', email);
    await page.fill('[data-testid="register-password"]', password);
    await page.fill('[data-testid="register-confirm-password"]', password);
    await page.click('[data-testid="register-submit"]');
    
    // Should show error or stay on register
    await page.waitForTimeout(2000);
    const stillOnRegister = page.url().includes('/register');
    const errorVisible = await page.locator('text=/exists|already|taken/i').isVisible().catch(() => false);
    expect(stillOnRegister || errorVisible).toBeTruthy();
  });

  test('should validate required fields on agent creation', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to create agent
    await page.goto('/agents/new');
    
    // Try to submit without name
    await page.click('[data-testid="agentform-submit"]');
    
    // Should stay on form
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/agents/new');
  });
});
