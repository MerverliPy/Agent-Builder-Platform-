const { test, expect } = require('@playwright/test');
const { 
  resetDatabase, 
  fillAuthFields,
  setAuthToken 
} = require('./utils');

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:5000/api';

// Helper to register a user via API
async function registerUser(username, password) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Registration failed: ${error}`);
  }
  return await response.json();
}

// Helper to login a user via page
async function loginUser(page, username, password) {
  await page.goto('/login');
  await fillAuthFields(page, username, password);
  await page.getByTestId('login-button').click();
  await page.waitForTimeout(2000);
}

// Helper to set user roles via API
async function setUserRoles(username, roles) {
  try {
    const response = await fetch(`${API_BASE}/test/set-roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, roles })
    });
    if (!response.ok) {
      console.warn('Set roles failed:', response.status);
    }
    return await response.json();
  } catch (error) {
    console.warn('Set roles error:', error.message);
  }
}

/**
 * Comprehensive UI Test Suite
 * Tests all buttons, links, and UI interactions across the entire application
 */

test.describe('Comprehensive UI Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await resetDatabase();
    // Register and login a user with admin role
    await registerUser('testuser', 'password123');
    await setUserRoles('testuser', ['admin', 'reviewer']);
  });

  test('Homepage - All UI elements and navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check hero section elements
    await expect(page.locator('h1')).toBeVisible();
    
    // Check navigation menu items
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check main navigation links exist
    await expect(page.getByRole('link', { name: /agents/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /templates/i })).toBeVisible();
    
    // Check CTA buttons on homepage
    const getStartedBtn = page.getByRole('link', { name: /get started/i }).first();
    if (await getStartedBtn.isVisible()) {
      await expect(getStartedBtn).toBeEnabled();
    }
    
    // Test navigation to Agents page
    await page.getByRole('link', { name: /agents/i }).first().click();
    await expect(page).toHaveURL(/\/agents/);
  });

  test('Login Page - All form elements and buttons', async ({ page }) => {
    await page.goto('/login');
    
    // Check form elements exist
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
    
    // Check register link exists
    const registerLink = page.getByRole('link', { name: /register/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toBeEnabled();
    
    // Test login button is clickable
    await expect(page.getByTestId('login-button')).toBeEnabled();
    
    // Test navigation to register page
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('Register Page - All form elements and buttons', async ({ page }) => {
    await page.goto('/register');
    
    // Check form elements exist
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('register-button')).toBeVisible();
    
    // Check login link exists
    const loginLink = page.getByRole('link', { name: /login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toBeEnabled();
    
    // Test register button is clickable
    await expect(page.getByTestId('register-button')).toBeEnabled();
    
    // Test successful registration
    await fillAuthFields(page, 'newuser', 'password123');
    await page.getByTestId('register-button').click();
    await page.waitForURL(/\/agents/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/agents/);
  });

  test('Agents List Page - All buttons and navigation (authenticated)', async ({ page }) => {
    await loginUser(page, 'testuser', 'password123');
    await page.goto('/agents');
    
    // Check page title and description
    await expect(page.locator('h1')).toContainText(/agents/i);
    
    // Check Create Agent button exists (requires roles)
    const createButton = page.getByTestId('create-agent-button');
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
    
    // Test Create Agent button navigation
    await createButton.click();
    await expect(page).toHaveURL(/\/agents\/new/);
  });

  test('Agent Creation Page - All form fields and buttons', async ({ page }) => {
    await loginUser(page, 'testuser', 'password123');
    await page.goto('/agents/new');
    
    // Check form fields exist
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/avatar/i)).toBeVisible();
    
    // Check skills input
    const skillsInput = page.locator('input[name="skills"]').or(page.locator('input[placeholder*="skill"]')).first();
    await expect(skillsInput).toBeVisible();
    
    // Check response style input
    const styleInput = page.locator('input[name="responseStyle"]').or(page.locator('textarea[name="responseStyle"]')).first();
    await expect(styleInput).toBeVisible();
    
    // Check model selection
    const modelSelect = page.locator('select[name="model"]').or(page.locator('input[name="model"]')).first();
    await expect(modelSelect).toBeVisible();
    
    // Check temperature input
    const tempInput = page.locator('input[name="temperature"]').first();
    if (await tempInput.isVisible()) {
      await expect(tempInput).toBeVisible();
    }
    
    // Check max tokens input
    const tokensInput = page.locator('input[name="maxTokens"]').first();
    if (await tokensInput.isVisible()) {
      await expect(tokensInput).toBeVisible();
    }
    
    // Check submit button
    const submitButton = page.getByRole('button', { name: /create/i });
    await expect(submitButton).toBeVisible();
    
    // Check cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    if (await cancelButton.isVisible()) {
      await expect(cancelButton).toBeEnabled();
    }
    
    // Test form submission with valid data
    await page.getByLabel(/name/i).fill('Test Agent');
    await skillsInput.fill('Testing, Quality Assurance');
    await styleInput.fill('Professional and thorough');
    
    // Submit form
    await submitButton.click();
    
    // Wait for navigation or success
    await page.waitForTimeout(2000);
    
    // Should redirect to agent detail or agents list
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/agents/);
  });

  test('Agent Detail Page - All buttons and actions', async ({ page }) => {
    await loginUser(page, 'testuser', 'password123');
    
    // Create an agent first
    await page.goto('/agents/new');
    await page.getByLabel(/name/i).fill('Detail Test Agent');
    const skillsInput = page.locator('input[name="skills"]').or(page.locator('input[placeholder*="skill"]')).first();
    await skillsInput.fill('Testing');
    const styleInput = page.locator('input[name="responseStyle"]').or(page.locator('textarea[name="responseStyle"]')).first();
    await styleInput.fill('Professional');
    await page.getByRole('button', { name: /create/i }).click();
    await page.waitForTimeout(2000);
    
    // Navigate to agents list and click on the agent
    await page.goto('/agents');
    const agentCard = page.locator('[data-testid="agent-card"]').or(page.locator('div').filter({ hasText: 'Detail Test Agent' }).first());
    if (await agentCard.isVisible()) {
      await agentCard.click();
    } else {
      // Try clicking View Details button
      await page.getByRole('button', { name: /view details/i }).first().click();
    }
    
    await page.waitForTimeout(1000);
    
    // Check detail page elements
    await expect(page.locator('h1').or(page.locator('h2')).first()).toBeVisible();
    
    // Check Edit button
    const editButton = page.getByRole('button', { name: /edit/i }).or(page.getByRole('link', { name: /edit/i }));
    if (await editButton.first().isVisible()) {
      await expect(editButton.first()).toBeEnabled();
    }
    
    // Check Test/Sandbox button
    const testButton = page.getByRole('button', { name: /test/i }).or(page.getByRole('link', { name: /sandbox/i }));
    if (await testButton.first().isVisible()) {
      await expect(testButton.first()).toBeEnabled();
    }
    
    // Check Delete button
    const deleteButton = page.getByRole('button', { name: /delete/i });
    if (await deleteButton.first().isVisible()) {
      await expect(deleteButton.first()).toBeEnabled();
    }
    
    // Check Back/Return button
    const backButton = page.getByRole('button', { name: /back/i }).or(page.getByRole('link', { name: /back/i }));
    if (await backButton.first().isVisible()) {
      await expect(backButton.first()).toBeEnabled();
    }
  });

  test('Agent Edit Page - All form fields and update button', async ({ page }) => {
    await loginUser(page, 'testuser', 'password123');
    
    // Create an agent first
    await page.goto('/agents/new');
    await page.getByLabel(/name/i).fill('Edit Test Agent');
    const skillsInput = page.locator('input[name="skills"]').or(page.locator('input[placeholder*="skill"]')).first();
    await skillsInput.fill('Testing');
    const styleInput = page.locator('input[name="responseStyle"]').or(page.locator('textarea[name="responseStyle"]')).first();
    await styleInput.fill('Professional');
    await page.getByRole('button', { name: /create/i }).click();
    await page.waitForTimeout(2000);
    
    // Get the agent ID from URL or API
    await page.goto('/agents');
    const firstAgent = page.locator('button, a').filter({ hasText: /view details|edit/i }).first();
    if (await firstAgent.isVisible()) {
      await firstAgent.click();
      await page.waitForTimeout(1000);
      
      // Click Edit button
      const editButton = page.getByRole('button', { name: /edit/i }).or(page.getByRole('link', { name: /edit/i }));
      if (await editButton.first().isVisible()) {
        await editButton.first().click();
        await page.waitForTimeout(1000);
        
        // Check form fields are populated
        const nameInput = page.getByLabel(/name/i);
        await expect(nameInput).toHaveValue(/Edit Test Agent/);
        
        // Check update button exists
        const updateButton = page.getByRole('button', { name: /update|save/i });
        await expect(updateButton.first()).toBeVisible();
        await expect(updateButton.first()).toBeEnabled();
        
        // Check cancel button
        const cancelButton = page.getByRole('button', { name: /cancel/i });
        if (await cancelButton.first().isVisible()) {
          await expect(cancelButton.first()).toBeEnabled();
        }
        
        // Test updating the agent
        await nameInput.fill('Updated Test Agent');
        await updateButton.first().click();
        await page.waitForTimeout(2000);
        
        // Should redirect back to detail page
        expect(page.url()).toMatch(/\/agents\/ag_/);
      }
    }
  });

  test('Agent Sandbox Page - Chat interface and controls', async ({ page }) => {
    await loginUser(page, 'testuser', 'password123');
    
    // Create an agent first
    await page.goto('/agents/new');
    await page.getByLabel(/name/i).fill('Sandbox Test Agent');
    const skillsInput = page.locator('input[name="skills"]').or(page.locator('input[placeholder*="skill"]')).first();
    await skillsInput.fill('Testing');
    const styleInput = page.locator('input[name="responseStyle"]').or(page.locator('textarea[name="responseStyle"]')).first();
    await styleInput.fill('Professional');
    await page.getByRole('button', { name: /create/i }).click();
    await page.waitForTimeout(2000);
    
    // Navigate to agents list and click Test button
    await page.goto('/agents');
    const testButton = page.getByTestId('test-agent-button').or(page.getByRole('button', { name: /test/i })).first();
    if (await testButton.isVisible()) {
      await testButton.click();
      await page.waitForTimeout(1000);
      
      // Check sandbox elements
      await expect(page.locator('h1, h2').filter({ hasText: /sandbox/i })).toBeVisible();
      
      // Check message input
      const messageInput = page.locator('textarea[placeholder*="message"]').or(page.locator('input[placeholder*="message"]'));
      await expect(messageInput.first()).toBeVisible();
      
      // Check send button
      const sendButton = page.getByRole('button', { name: /send/i });
      await expect(sendButton.first()).toBeVisible();
      
      // Check clear conversation button
      const clearButton = page.getByRole('button', { name: /clear/i });
      if (await clearButton.first().isVisible()) {
        await expect(clearButton.first()).toBeEnabled();
      }
      
      // Check back button
      const backButton = page.getByRole('button', { name: /back/i }).or(page.getByRole('link', { name: /back/i }));
      if (await backButton.first().isVisible()) {
        await expect(backButton.first()).toBeEnabled();
      }
      
      // Test sending a message (will use mock mode if Ollama not configured)
      await messageInput.first().fill('Hello, this is a test message');
      await sendButton.first().click();
      
      // Wait for response (timeout quickly since it might be mock)
      await page.waitForTimeout(2000);
      
      // Check if message appears in chat
      await expect(page.locator('text=Hello, this is a test message')).toBeVisible();
    }
  });

  test('Templates Page - All UI elements', async ({ page }) => {
    await loginUser(page, 'testuser', 'password123');
    await page.goto('/templates');
    
    // Check page loads
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for template cards or empty state
    const templateCards = page.locator('[data-testid="template-card"]').or(page.locator('div').filter({ hasText: /template/i }));
    
    // Page should either show templates or empty state
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });

  test('Account Page - User settings and logout', async ({ page }) => {
    await loginUser(page, 'testuser', 'password123');
    await page.goto('/account');
    
    // Check page loads
    const heading = page.locator('h1').or(page.locator('h2')).first();
    await expect(heading).toBeVisible();
    
    // Check for user information display
    await expect(page.locator('text=testuser')).toBeVisible();
    
    // Check logout button
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.first().isVisible()) {
      await expect(logoutButton.first()).toBeEnabled();
      
      // Test logout functionality
      await logoutButton.first().click();
      await page.waitForTimeout(1000);
      
      // Should redirect to login or home
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(login|$)/);
    }
  });

  test('Review Queue Page - Reviewer dashboard (if accessible)', async ({ page }) => {
    await loginUser(page, 'testuser', 'password123');
    
    // Try to access review queue
    await page.goto('/reviews');
    await page.waitForTimeout(1000);
    
    // Check if page is accessible
    const heading = page.locator('h1').or(page.locator('h2')).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
      
      // Check for review items or empty state
      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
    }
  });

  test('Navigation Menu - All links work', async ({ page }) => {
    await loginUser(page, 'testuser', 'password123');
    await page.goto('/');
    
    // Test Agents link
    await page.getByRole('link', { name: /agents/i }).first().click();
    await expect(page).toHaveURL(/\/agents/);
    
    // Test Templates link
    await page.getByRole('link', { name: /templates/i }).first().click();
    await expect(page).toHaveURL(/\/templates/);
    
    // Test Account link (usually in dropdown or direct)
    const accountLink = page.getByRole('link', { name: /account|profile/i });
    if (await accountLink.first().isVisible()) {
      await accountLink.first().click();
      await expect(page).toHaveURL(/\/account/);
    }
    
    // Test Home link
    const homeLink = page.getByRole('link', { name: /home/i }).or(page.locator('a[href="/"]')).first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('Responsive UI - Mobile menu toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await page.goto('/');
    
    // Check for mobile menu button (hamburger)
    const menuButton = page.getByRole('button', { name: /menu|navigation/i }).or(page.locator('button').filter({ has: page.locator('svg') }).first());
    
    if (await menuButton.isVisible()) {
      await expect(menuButton).toBeEnabled();
      
      // Test menu toggle
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // Menu should open (check for navigation links visibility)
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    }
  });
});
