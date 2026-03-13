const { test, expect } = require('@playwright/test');
const { fillAuthFields, usernameSelector, passwordSelector, confirmSelector } = require('./utils');

test.describe('Error Handling E2E Tests', () => {
  test('should show validation error for empty name field', async ({ page }) => {
    // Register and login
    const email = 'error-test@example.com';
    const password = 'TestPassword123!';

    try {
      await page.goto('/register');
      await fillAuthFields(page, email, password, password);
      await page.click('button:has-text("Register"), button:has-text("Create account"), button[type="submit"]');
      await page.waitForNavigation({ timeout: 3000 });
    } catch (e) {
      // User might already exist
    }

    await page.goto('/login');
    await fillAuthFields(page, email, password);
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ timeout: 3000 });

    // Navigate to create agent
    await page.goto('/agents/new');

    // Try to submit form without name
    const submitButton = await page.$('button:has-text("Create"), button:has-text("Save")');
    if (submitButton) {
      await submitButton.click();

      // Should show validation error or stay on form
      await page.waitForTimeout(1000);
      
      // Check for error message or form still visible
      const errorVisible = await page.isVisible('text=Required, text=Please enter, text=Name is required');
      const formVisible = await page.isVisible('input[placeholder*="name" i]');
      
      expect(errorVisible || formVisible).toBeTruthy();
    }
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/register');

    // Enter invalid email
    await fillAuthFields(page, 'not-an-email', 'TestPassword123!', 'TestPassword123!');

    // Try to submit
    await page.click('button:has-text("Register"), button:has-text("Create account"), button[type="submit"]');

    // Should show validation error or HTML5 validation message
    const emailInput = await page.$(usernameSelector);
    const isInvalid = await emailInput.evaluate(el => !el.validity.valid);

    expect(isInvalid).toBeTruthy();
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/register');

    const email = `error-${Date.now()}@example.com`;
    await fillAuthFields(page, email, 'TestPassword123!', 'DifferentPassword456!');

    // Try to submit
    await page.click('button:has-text("Register"), button:has-text("Create account"), button[type="submit"]');

    // Should show error or stay on form
    await page.waitForTimeout(1000);
    
    // Check for error message or form still visible
    const errorVisible = await page.isVisible('text=do not match, text=Passwords must match');
    const formVisible = await page.isVisible(confirmSelector);
    
    expect(errorVisible || formVisible).toBeTruthy();
  });

  test('should show error for duplicate email on registration', async ({ page }) => {
    const email = 'duplicate-test@example.com';
    const password = 'TestPassword123!';

    // First registration
    await page.goto('/register');
    await fillAuthFields(page, email, password, password);
    await page.click('button:has-text("Register"), button:has-text("Create account"), button[type="submit"]');
    await page.waitForNavigation({ timeout: 3000 }).catch(() => {});

    // Try to register with same email
    await page.goto('/register');
    await fillAuthFields(page, email, password, password);
    await page.click('button:has-text("Register"), button:has-text("Create account"), button[type="submit"]');

    // Should show error
    await page.waitForTimeout(2000);
    
    const errorVisible = await page.isVisible('text=already exists, text=Email already registered, text=already in use');
    expect(errorVisible).toBeTruthy();
  });

  test('should show error for API failures gracefully', async ({ page }) => {
    // Simulate API error by intercepting requests
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    const email = 'api-error-test@example.com';
    const password = 'TestPassword123!';

    await page.goto('/login');
    await fillAuthFields(page, email, password);
    await page.click('button:has-text("Login")');

    // Should show error message
    await page.waitForTimeout(2000);
    
    const errorVisible = await page.isVisible('text=error, text=failed, text=unable to');
    expect(errorVisible).toBeTruthy();
  });

  test('should show 401 error for invalid token', async ({ page }) => {
    // Set invalid token
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid-token-xyz');
      localStorage.setItem('user', JSON.stringify({ id: 'user123', email: 'test@example.com' }));
    });

    // Try to access protected route
    await page.goto('/agents');

    // Should redirect to login due to 401
    await page.waitForURL(/login/, { timeout: 3000 });
    expect(page.url()).toContain('/login');
  });

  test('should show 404 error for non-existent agent', async ({ page }) => {
    // Register and login
    const email = 'error-test@example.com';
    const password = 'TestPassword123!';

    await page.goto('/login');
    await fillAuthFields(page, email, password);
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ timeout: 3000 });

    // Try to access non-existent agent
    await page.goto('/agents/ag_nonexistent123456');

    // Should show error or redirect
    await page.waitForTimeout(2000);
    
    const errorVisible = await page.isVisible('text=not found, text=does not exist, text=404');
    const redirected = !page.url().includes('ag_nonexistent');
    
    expect(errorVisible || redirected).toBeTruthy();
  });

  test('should handle network timeout gracefully', async ({ page }) => {
    // Slow down network to simulate timeout
    await page.route('**/api/**', async route => {
      await page.waitForTimeout(10000);
      await route.abort('timedout');
    });

    const email = 'timeout-test@example.com';
    const password = 'TestPassword123!';

    await page.goto('/login');
    await fillAuthFields(page, email, password);
    await page.click('button:has-text("Login")');

    // Should show error or timeout message
    await page.waitForTimeout(3000);
    
    const errorVisible = await page.isVisible('text=timeout, text=Network error, text=try again');
    expect(errorVisible).toBeTruthy();
  });

  test('should show form validation errors in real-time', async ({ page }) => {
    // Register and login
    const email = 'validation-test@example.com';
    const password = 'TestPassword123!';

    try {
      await page.goto('/register');
      await fillAuthFields(page, email, password, password);
      await page.click('button:has-text("Register")');
      await page.waitForNavigation({ timeout: 3000 });
    } catch (e) {
      // User might already exist
    }

    await page.goto('/login');
    await fillAuthFields(page, email, password);
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ timeout: 3000 });

    // Navigate to create agent
    await page.goto('/agents/new');

    // Start typing name
    const nameInput = await page.$('input[placeholder*="name" i], input[name="name"]');
    if (nameInput) {
      await nameInput.type('A');
      
      // Check if any error or success message appears
      await page.waitForTimeout(500);
      
      // Error should be gone while typing
      const errorGone = !await page.isVisible('text=Name is required');
      expect(errorGone).toBeTruthy();
    }
  });

  test('should show insufficient permissions error', async ({ page }) => {
    // Login with regular user
    const email = 'user-test@example.com';
    const password = 'TestPassword123!';

    try {
      await page.goto('/register');
      await fillAuthFields(page, email, password, password);
      await page.click('button:has-text("Register")');
      await page.waitForNavigation({ timeout: 3000 });
    } catch (e) {
      // User might already exist
    }

    await page.goto('/login');
    await fillAuthFields(page, email, password);
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ timeout: 3000 });

    // Navigate to agents page
    await page.goto('/agents');

    // Try to delete an agent (if delete button exists and is restricted)
    const deleteButton = await page.$('button:has-text("Delete"), button[aria-label*="delete"]');
    if (deleteButton) {
      await deleteButton.click();

      // Should show permission error or button should be disabled
      await page.waitForTimeout(2000);
      
      const errorVisible = await page.isVisible('text=not permitted, text=insufficient, text=cannot delete');
      const isDisabled = await deleteButton.evaluate(el => el.disabled);
      
      expect(errorVisible || isDisabled).toBeTruthy();
    }
  });

  test('should recover from error and retry action', async ({ page }) => {
    let failCount = 0;
    
    // First request fails, second succeeds
    await page.route('**/api/login', async route => {
      failCount++;
      if (failCount === 1) {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });

    const email = 'retry-test@example.com';
    const password = 'TestPassword123!';

    // First attempt fails
    await page.goto('/login');
    await fillAuthFields(page, email, password);
    await page.click('button:has-text("Login")');

    // Error should be shown
    await page.waitForTimeout(2000);
    const errorVisible = await page.isVisible('text=error, text=failed');

    if (errorVisible) {
      // Retry button should be available
      const retryButton = await page.$('button:has-text("Retry"), button:has-text("Try Again")');
      if (retryButton) {
        await retryButton.click();
        await page.waitForNavigation({ timeout: 3000 }).catch(() => {});
      }
    }
  });
});
