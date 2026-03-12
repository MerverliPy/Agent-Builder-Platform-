const { test, expect } = require('@playwright/test')

test.describe('Agent Builder UI', () => {
  test('user can sign up, login, create and delete an agent (API-backed)', async ({ page }) => {
    // this test assumes server is running at http://localhost:5000 and client started separately
    await page.goto('http://localhost:3000')

    // go to login, create a user via API (server side)
    const username = `ui_${Date.now()}`
    const password = 'pw123456'
    // register via API
    await page.request.post('http://localhost:5000/api/auth/register', { data: { username, password, roles: ['admin'] } })
    // perform login via UI
    await page.goto('http://localhost:3000/login')
    await page.fill('input[aria-label="Username"]', username)
    await page.fill('input[aria-label="Password"]', password)
    await page.click('button:has-text("Sign in")')
    await page.waitForURL('**/agents')

    // create new agent via UI
    await page.goto('http://localhost:3000/agents/new')
    await page.fill('#agent-name', 'Playwright Agent')
    await page.click('button:has-text("Create")')
    // expect to be redirected to detail page
    await page.waitForURL('**/agents/*')
    await expect(page.locator('h2')).toHaveText('Playwright Agent')

    // delete via UI
    await page.click('text=Delete')
    await page.click('text=OK')
    // after deletion go back to list
    await page.waitForURL('**/agents')
  })
})
