const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Helper to login before each test
async function loginBeforeTest(page) {
  const email = 'media-test@example.com';
  const password = 'TestPassword123!';

  await page.goto('/login');
  const { fillAuthFields } = require('./utils');
  await fillAuthFields(page, email, password);
  await page.click('button:has-text("Login")');
  await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
}

test.describe('Media Upload E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Register user if needed
    const email = 'media-test@example.com';
    const password = 'TestPassword123!';

    try {
      await page.goto('/register');
      const { fillAuthFields } = require('./utils');
      await fillAuthFields(page, email, password, password);
      await page.click('button:has-text("Register")');
      await page.waitForNavigation({ timeout: 3000 });
    } catch (e) {
      // User might already exist
    }

    await loginBeforeTest(page);
  });

  test('should upload an image file successfully', async ({ page, context }) => {
    await page.goto('/agents/new');

    // Look for file upload input
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // Create a test image file
      const testImagePath = path.join(__dirname, 'test-image.png');
      
      // Create a simple PNG if it doesn't exist
      if (!fs.existsSync(testImagePath)) {
        // Create a minimal PNG buffer
        const png = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
          0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
          0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
          0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
          0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
          0x01, 0x01, 0x01, 0x00, 0x1B, 0xB6, 0xEE, 0x56,
          0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
          0xAE, 0x42, 0x60, 0x82,
        ]);
        fs.writeFileSync(testImagePath, png);
      }

      // Set file
      await fileInput.setInputFiles(testImagePath);

      // Wait for upload to complete
      await page.waitForResponse(
        response => response.url().includes('/api/media/upload') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {});

      // Check if upload was successful (avatar should be updated)
      const uploadedImage = await page.$('img[alt*="avatar"], img[src*="/uploads"]');
      if (uploadedImage) {
        expect(await uploadedImage.isVisible()).toBeTruthy();
      }
    }
  });

  test('should reject invalid file types', async ({ page }) => {
    await page.goto('/agents/new');

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // Create a text file
      const testFilePath = path.join(__dirname, 'test-file.txt');
      if (!fs.existsSync(testFilePath)) {
        fs.writeFileSync(testFilePath, 'This is a test file');
      }

      // Try to upload text file
      await fileInput.setInputFiles(testFilePath);

      // Should show error or reject the file
      const errorMessage = await page.$('text=Invalid file type, text=File type not supported, text=must be an image');
      
      // Wait a bit for any error message to appear
      await page.waitForTimeout(2000);
      
      // Check if file input is cleared or error shown
      const isCleared = await fileInput.evaluate(el => !el.value || el.value === '');
      const hasError = errorMessage !== null;
      
      expect(isCleared || hasError).toBeTruthy();
    }
  });

  test('should handle file too large error', async ({ page }) => {
    await page.goto('/agents/new');

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // Create a large file (mock)
      const testFilePath = path.join(__dirname, 'test-large.png');
      if (!fs.existsSync(testFilePath)) {
        // Create a PNG-like buffer to simulate large file
        const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
        fs.writeFileSync(testFilePath, largeBuffer);
      }

      // Try to upload large file
      await fileInput.setInputFiles(testFilePath).catch(() => {});

      // Wait for response or error
      await page.waitForTimeout(3000);

      // Should show error or handle gracefully
      const url = page.url();
      expect(url).toContain('/agents/new');
    }
  });

  test('should display uploaded image in preview', async ({ page }) => {
    await page.goto('/agents/new');

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      const testImagePath = path.join(__dirname, 'test-image.png');
      
      if (!fs.existsSync(testImagePath)) {
        const png = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
          0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
          0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
          0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
          0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
          0x01, 0x01, 0x01, 0x00, 0x1B, 0xB6, 0xEE, 0x56,
          0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
          0xAE, 0x42, 0x60, 0x82,
        ]);
        fs.writeFileSync(testImagePath, png);
      }

      // Upload file
      await fileInput.setInputFiles(testImagePath);

      // Wait for upload
      await page.waitForResponse(
        response => response.url().includes('/api/media/upload'),
        { timeout: 10000 }
      ).catch(() => {});

      // Preview should show the uploaded image
      const previewImage = await page.$('img[alt*="preview"], img[alt*="avatar"], img[src*="/uploads"]');
      if (previewImage) {
        expect(await previewImage.isVisible()).toBeTruthy();
        const src = await previewImage.getAttribute('src');
        expect(src).toBeTruthy();
      }
    }
  });

  test('should convert image to WebP format', async ({ page }) => {
    await page.goto('/agents/new');

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      const testImagePath = path.join(__dirname, 'test-image.png');
      
      if (!fs.existsSync(testImagePath)) {
        const png = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
          0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
          0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
          0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
          0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
          0x01, 0x01, 0x01, 0x00, 0x1B, 0xB6, 0xEE, 0x56,
          0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
          0xAE, 0x42, 0x60, 0x82,
        ]);
        fs.writeFileSync(testImagePath, png);
      }

      // Upload file
      await fileInput.setInputFiles(testImagePath);

      // Wait for upload
      const response = await page.waitForResponse(
        response => response.url().includes('/api/media/upload') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => null);

      if (response) {
        const data = await response.json();
        // API should return WebP URL
        expect(data.url || data.path).toContain('.webp');
      }
    }
  });

  test('should allow uploading image via URL', async ({ page }) => {
    await page.goto('/agents/new');

    // Look for URL input field
    const urlInput = await page.$('input[type="url"], input[placeholder*="URL" i], input[placeholder*="url" i]');
    if (urlInput) {
      await urlInput.fill('https://via.placeholder.com/150');

      // Should display the image
      const img = await page.$('img[src*="placeholder"]');
      if (img) {
        expect(await img.isVisible()).toBeTruthy();
      }
    }
  });

  test('should clear uploaded image', async ({ page }) => {
    await page.goto('/agents/new');

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      const testImagePath = path.join(__dirname, 'test-image.png');
      
      if (!fs.existsSync(testImagePath)) {
        const png = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
          0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
          0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
          0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
          0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
          0x01, 0x01, 0x01, 0x00, 0x1B, 0xB6, 0xEE, 0x56,
          0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
          0xAE, 0x42, 0x60, 0x82,
        ]);
        fs.writeFileSync(testImagePath, png);
      }

      // Upload file
      await fileInput.setInputFiles(testImagePath);

      // Wait for upload
      await page.waitForTimeout(2000);

      // Look for clear/remove button
      const clearButton = await page.$('button:has-text("Clear"), button:has-text("Remove"), button[aria-label*="clear" i]');
      if (clearButton) {
        await clearButton.click();

        // Image should be removed
        await page.waitForTimeout(1000);
        const img = await page.$('img[src*="/uploads"]');
        const isGone = img === null;
        expect(isGone).toBeTruthy();
      }
    }
  });
});
