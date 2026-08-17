import { expect, test } from '@playwright/test'

// `npm run build` must run first — this serves the built dist/, not the dev
// server, so it also proves the CSS/JS actually made it through the build.
test.describe('playground visual regression', () => {
  test('light theme', async ({ page }) => {
    await page.goto('/playground.html')
    await page.getByRole('button', { name: 'light' }).click()
    await expect(page.getByText('Component gallery')).toBeVisible()
    await expect(page).toHaveScreenshot('playground-light.png', { fullPage: true })
  })

  test('dark theme', async ({ page }) => {
    await page.goto('/playground.html')
    await page.getByRole('button', { name: 'dark' }).click()
    await expect(page.getByText('Component gallery')).toBeVisible()
    await expect(page).toHaveScreenshot('playground-dark.png', { fullPage: true })
  })
})
